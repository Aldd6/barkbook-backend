const dbConnection = require('../../shared/utils/index.js');
const Booking = dbConnection.Booking;
const BookingPet = dbConnection.BookingPet;
const BookingBill = dbConnection.BookingBill;
const RoomBranch = dbConnection.RoomBranch;
const RoomType = dbConnection.RoomType;
const Customer = dbConnection.Customer;
const Pet = dbConnection.Pet;
const sequelize = dbConnection.sequelize;
const Op = dbConnection.Sequelize.Op;
const { ApiError } = require('../../shared/utils/errors.js');
const { BOOKING_STATUS, MOVEMENT_TYPE, PAYMENT_METHOD } = require('../../shared/constants/enums.js');
const { getStripeClient } = require('../../shared/config/stripe.js');

// Estados que todavia "ocupan" un cupo de la RoomBranch para efectos de
// disponibilidad. FINALIZADA y CANCELADA liberan el cupo.
const ACTIVE_STATUSES = [BOOKING_STATUS.PDCN, BOOKING_STATUS.CNFD, BOOKING_STATUS.ENES];
const PENDING_GRACE_PERIOD_DAYS = 5;
// Token de prueba publico de Stripe para un pago con tarjeta exitoso en modo
// test. Ver DTOs/create-booking.js para el contexto de por que existe.
const DEFAULT_TEST_PAYMENT_METHOD = 'pm_card_visa';

const nightsBetween = (checkInDate, checkOutDate) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((new Date(checkOutDate) - new Date(checkInDate)) / msPerDay);
}

const withDetails = (booking) => Booking.findByPk(booking.id, {
    include: [
        { model: BookingPet },
        { model: BookingBill }
    ]
});

const create = async (createBookingDTO) => {
    const { branchRoomId, customerId, checkInDate, checkOutDate, petIds, paymentMethod, stripePaymentMethodId } = createBookingDTO;
    const uniquePetIds = [...new Set(petIds)];

    const newBooking = await sequelize.transaction(async (transaction) => {
        // Bloquea la RoomBranch: dos reservas concurrentes para la misma
        // sede+tipo no pueden pasar ambas la validacion de disponibilidad.
        const roomBranch = await RoomBranch.findByPk(branchRoomId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if(!roomBranch) throw new ApiError(`La configuracion de habitaciones con el ID ${branchRoomId} no existe.`, "RESOURCE_NOT_FOUND");

        const roomType = await RoomType.findByPk(roomBranch.roomTypeId, { transaction });
        if(!roomType) throw new ApiError(`El tipo de habitacion con el ID ${roomBranch.roomTypeId} no existe.`, "RESOURCE_NOT_FOUND");

        const customer = await Customer.findByPk(customerId, { transaction });
        if(!customer) throw new ApiError(`El cliente con el ID ${customerId} no existe.`, "RESOURCE_NOT_FOUND");

        const pets = await Pet.findAll({
            where: { id: uniquePetIds, customerId },
            transaction
        });
        if(pets.length !== uniquePetIds.length) {
            throw new ApiError("Una o mas mascotas no existen o no pertenecen a este cliente.", "RESOURCE_NOT_FOUND");
        }
        if(pets.length > roomType.maximumNumberOfGuests) {
            throw new ApiError(`Este tipo de habitacion admite maximo ${roomType.maximumNumberOfGuests} huesped(es); se enviaron ${pets.length}.`, "INVALID_INPUT");
        }
        if(pets.some(pet => pet.species !== roomType.speciesType)) {
            throw new ApiError(`Todas las mascotas de la reserva deben ser de la especie admitida por este tipo de habitacion (${roomType.speciesType}).`, "INVALID_INPUT");
        }

        // Disponibilidad: cuenta reservas activas de esta misma RoomBranch
        // cuyo rango de fechas se traslape con el solicitado.
        const overlappingCount = await Booking.count({
            where: {
                branchRoomId,
                bookingStatus: { [Op.in]: ACTIVE_STATUSES },
                checkInDate: { [Op.lt]: checkOutDate },
                checkOutDate: { [Op.gt]: checkInDate }
            },
            transaction
        });
        if(overlappingCount >= roomBranch.maximumQuantity) {
            throw new ApiError(`No hay disponibilidad para esas fechas: las ${roomBranch.maximumQuantity} unidad(es) de este tipo de habitacion en esta sede ya estan ocupadas o reservadas.`, "RESOURCE_CONFLICT");
        }

        const nights = nightsBetween(checkInDate, checkOutDate);
        const nightlyRate = roomType.nightlyRate;
        const totalAmount = Math.round(parseFloat(nightlyRate) * nights * 100) / 100;

        let bookingStatus = BOOKING_STATUS.PDCN;
        let stripePaymentIntentId = null;

        if(paymentMethod === PAYMENT_METHOD.TARJETA) {
            const stripeClient = getStripeClient();
            let paymentIntent;
            try {
                paymentIntent = await stripeClient.paymentIntents.create({
                    amount: Math.round(totalAmount * 100),
                    currency: 'gtq',
                    payment_method: stripePaymentMethodId || DEFAULT_TEST_PAYMENT_METHOD,
                    payment_method_types: ['card'],
                    confirm: true,
                    off_session: true,
                    error_on_requires_action: true,
                    description: `Reserva BarkBook - Cliente #${customerId}`
                });
            } catch(err) {
                throw new ApiError(`El pago con Stripe fue rechazado: ${err.message}`, "PAYMENT_FAILED");
            }
            if(paymentIntent.status !== 'succeeded') {
                throw new ApiError(`El pago con Stripe no se pudo completar (estado: ${paymentIntent.status}).`, "PAYMENT_FAILED");
            }
            bookingStatus = BOOKING_STATUS.CNFD;
            stripePaymentIntentId = paymentIntent.id;
        }

        const booking = await Booking.create({
            branchRoomId,
            customerId,
            checkInDate,
            checkOutDate,
            bookingStatus,
            nightlyRate
        }, { transaction });

        await BookingPet.bulkCreate(
            uniquePetIds.map(petId => ({ bookingId: booking.id, petId })),
            { transaction, validate: true }
        );

        await BookingBill.create({
            bookingId: booking.id,
            movementType: MOVEMENT_TYPE.CARGO,
            amount: totalAmount,
            methodPayment: paymentMethod,
            reference: null,
            description: `Cargo por reserva #${booking.id} (${nights} noche(s) a Q${nightlyRate} por noche).`
        }, { transaction });

        if(bookingStatus === BOOKING_STATUS.CNFD) {
            await BookingBill.create({
                bookingId: booking.id,
                movementType: MOVEMENT_TYPE.ABONO,
                amount: totalAmount,
                methodPayment: paymentMethod,
                reference: stripePaymentIntentId,
                description: `Pago con tarjeta via Stripe - Reserva #${booking.id}.`
            }, { transaction });
        }

        return booking;
    });

    return withDetails(newBooking);
}

const confirmPayment = async (id, confirmBookingPaymentDTO) => {
    const { methodPayment, reference, description } = confirmBookingPaymentDTO;

    const updatedBooking = await sequelize.transaction(async (transaction) => {
        const booking = await Booking.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
        if(!booking) throw new ApiError(`La reserva con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
        if(booking.bookingStatus !== BOOKING_STATUS.PDCN) {
            throw new ApiError(`Solo se puede confirmar el pago de una reserva en estado "${BOOKING_STATUS.PDCN}". Estado actual: "${booking.bookingStatus}".`, "RESOURCE_CONFLICT");
        }

        const bills = await BookingBill.findAll({ where: { bookingId: id }, transaction });
        const totalCargo = bills
            .filter(bill => bill.movementType === MOVEMENT_TYPE.CARGO)
            .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const totalAbono = bills
            .filter(bill => bill.movementType === MOVEMENT_TYPE.ABONO)
            .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const remaining = Math.round((totalCargo - totalAbono) * 100) / 100;

        if(remaining <= 0) throw new ApiError("Esta reserva ya esta completamente pagada.", "RESOURCE_CONFLICT");

        await BookingBill.create({
            bookingId: id,
            movementType: MOVEMENT_TYPE.ABONO,
            amount: remaining,
            methodPayment,
            reference: reference ?? null,
            description: description || `Pago confirmado por el personal del hotel (${methodPayment}) - Reserva #${id}.`
        }, { transaction });

        await booking.update({ bookingStatus: BOOKING_STATUS.CNFD }, { transaction });
        return booking;
    });

    return withDetails(updatedBooking);
}

const sweepExpiredBookings = async () => {
    const cutoff = new Date(Date.now() - PENDING_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const expiredBookings = await Booking.findAll({
        where: {
            bookingStatus: BOOKING_STATUS.PDCN,
            createdAt: { [Op.lte]: cutoff }
        }
    });

    for(const booking of expiredBookings) {
        await booking.update({
            bookingStatus: BOOKING_STATUS.CNCL,
            cancellationReason: `Cancelada automaticamente: no se confirmo el pago dentro del plazo de ${PENDING_GRACE_PERIOD_DAYS} dias.`
        });
    }

    return expiredBookings;
}

const getPendingWithTimeRemaining = async () => {
    await sweepExpiredBookings();

    const pendingBookings = await Booking.findAll({
        where: { bookingStatus: BOOKING_STATUS.PDCN },
        include: [{ model: BookingPet }, { model: BookingBill }]
    });

    const now = Date.now();
    return pendingBookings.map(booking => {
        const expiresAt = new Date(booking.createdAt.getTime() + PENDING_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        return {
            booking,
            expiresAt,
            hoursRemaining: Math.floor(Math.max(expiresAt.getTime() - now, 0) / (60 * 60 * 1000))
        };
    });
}

const getAutoCancelledBookings = async () => {
    await sweepExpiredBookings();

    return await Booking.findAll({
        where: {
            bookingStatus: BOOKING_STATUS.CNCL,
            cancellationReason: { [Op.ne]: null }
        },
        include: [{ model: BookingPet }, { model: BookingBill }]
    });
}

const getById = async (id) => {
    const booking = await withDetails({ id });
    if(!booking) throw new ApiError(`La reserva con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return booking;
}

const getAll = async () => {
    return await Booking.findAll({ include: [{ model: BookingPet }, { model: BookingBill }] });
}

const getAllByCustomer = async (customerId) => {
    const customerExists = await Customer.findByPk(customerId);
    if(!customerExists) throw new ApiError(`El cliente con el ID ${customerId} no existe.`, "RESOURCE_NOT_FOUND");

    return await Booking.findAll({
        where: { customerId },
        include: [{ model: BookingPet }, { model: BookingBill }]
    });
}

module.exports = { create, confirmPayment, getById, getAll, getAllByCustomer, getPendingWithTimeRemaining, getAutoCancelledBookings, sweepExpiredBookings };
