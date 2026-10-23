const dbConnection = require('../../shared/utils/index.js');
const CheckIn = dbConnection.CheckIn;
const CheckInPet = dbConnection.CheckInPet;
const Booking = dbConnection.Booking;
const BookingPet = dbConnection.BookingPet;
const BookingBill = dbConnection.BookingBill;
const BookingCancellation = dbConnection.BookingCancellation;
const RoomInventory = dbConnection.RoomInventory;
const Pet = dbConnection.Pet;
const PetVaccine = dbConnection.PetVaccine;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');
const { BOOKING_STATUS, CANCELLATION_STATUS, CHECK_IN_STATUS, MOVEMENT_TYPE, ROOM_STATUS } = require('../../shared/constants/enums.js');
const { todayISO } = require('../../shared/utils/dates.js');
const bookingService = require('../Booking/booking.service.js');

const CHECK_IN_ALLOWED_STATUSES = [BOOKING_STATUS.PDCN, BOOKING_STATUS.CNFD];
const PENDING_GRACE_PERIOD_DAYS = 5;

const roundMoney = (value) => Math.round(value * 100) / 100;

const sumByMovement = (bills, movementType) => bills
    .filter(bill => bill.movementType === movementType)
    .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

const withDetails = (checkIn) => CheckIn.findByPk(checkIn.id, {
    include: [
        { model: CheckInPet, include: [{ model: BookingPet }] },
        { model: RoomInventory }
    ]
});

const create = async (createCheckInDTO) => {
    const { bookingId, pets, customerAcceptsPartialAdmission, roomNumber, observations } = createCheckInDTO;

    await bookingService.sweepExpiredBookings();

    const newCheckIn = await sequelize.transaction(async (transaction) => {
        const booking = await Booking.findByPk(bookingId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");

        const existingCheckIn = await CheckIn.findOne({ where: { bookingId }, transaction });
        if(existingCheckIn) throw new ApiError(`La reserva con el ID ${bookingId} ya tiene un check-in registrado (estado: "${existingCheckIn.status}").`, "RESOURCE_CONFLICT");

        if(booking.bookingStatus === BOOKING_STATUS.CNCL) {
            throw new ApiError(`La reserva con el ID ${bookingId} ya no existe: fue cancelada. ${booking.cancellationReason ?? ''}`.trim(), "RESOURCE_CONFLICT");
        }
        if(!CHECK_IN_ALLOWED_STATUSES.includes(booking.bookingStatus)) {
            throw new ApiError(`No se puede hacer check-in de una reserva en estado "${booking.bookingStatus}".`, "RESOURCE_CONFLICT");
        }

        const pendingCancellation = await BookingCancellation.findOne({
            where: { bookingId, status: CANCELLATION_STATUS.PENDIENTE },
            transaction
        });
        if(pendingCancellation) {
            throw new ApiError(`La reserva #${bookingId} tiene una solicitud de cancelacion pendiente. Apruebela o rechacela antes de hacer el check-in.`, "RESOURCE_CONFLICT");
        }

        const today = todayISO();
        if(today < booking.checkInDate || today >= booking.checkOutDate) {
            throw new ApiError(`El check-in de esta reserva solo puede realizarse a partir del ${booking.checkInDate} y antes del ${booking.checkOutDate}.`, "INVALID_INPUT");
        }

        const bookingPets = await BookingPet.findAll({ where: { bookingId }, transaction });
        const bookingPetIds = new Set(bookingPets.map(bookingPet => bookingPet.id));
        const unknownPets = pets.filter(pet => !bookingPetIds.has(pet.bookingPetId));
        if(unknownPets.length > 0) {
            throw new ApiError(`Los siguientes detalles de mascota no pertenecen a la reserva #${bookingId}: ${unknownPets.map(pet => pet.bookingPetId).join(', ')}.`, "INVALID_INPUT");
        }
        if(pets.length !== bookingPets.length) {
            throw new ApiError(`Debe indicar si se admite o no a cada una de las ${bookingPets.length} mascota(s) de la reserva.`, "INVALID_INPUT");
        }

        const admittedCount = pets.filter(pet => pet.admitted).length;
        const allAdmitted = admittedCount === pets.length;
        const isValid = admittedCount > 0 && (allAdmitted || customerAcceptsPartialAdmission === true);

        const checkInPetRows = (checkInId) => pets.map(pet => ({
            checkInId,
            bookingPetId: pet.bookingPetId,
            admitted: pet.admitted,
            nonadmissionReason: pet.admitted ? null : pet.nonadmissionReason
        }));

        if(!isValid) {
            const cancellationReason = admittedCount === 0
                ? 'Check-in cancelado: ninguna mascota de la reserva fue admitida.'
                : 'Check-in cancelado: el cliente no acepto dejar solo las mascotas admitidas.';

            const checkIn = await CheckIn.create({
                bookingId,
                roomInventoryId: null,
                checkInDate: today,
                observations: observations ?? null,
                status: CHECK_IN_STATUS.CANCELADO
            }, { transaction });
            await CheckInPet.bulkCreate(checkInPetRows(checkIn.id), { transaction, validate: true });

            await booking.update({ bookingStatus: BOOKING_STATUS.CNCL, cancellationReason }, { transaction });
            await bookingService.refundBookingPayments(booking, transaction, 'Reembolso por check-in cancelado');

            return checkIn;
        }

        const bills = await BookingBill.findAll({ where: { bookingId }, transaction });
        const remaining = roundMoney(sumByMovement(bills, MOVEMENT_TYPE.CARGO) - sumByMovement(bills, MOVEMENT_TYPE.ABONO));
        if(booking.bookingStatus === BOOKING_STATUS.PDCN || remaining > 0) {
            const expiresAt = new Date(booking.creadoEn.getTime() + PENDING_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
            throw new ApiError(`La reserva #${bookingId} tiene un saldo pendiente de Q${remaining.toFixed(2)}. Registre el pago (PATCH /bookings/${bookingId}/confirm-payment) antes del ${expiresAt.toISOString()} y vuelva a realizar el check-in.`, "RESOURCE_CONFLICT");
        }

        if(!roomNumber) {
            throw new ApiError("Debe ingresar el numero de habitacion a asignar a la reserva.", "INVALID_INPUT");
        }
        const room = await RoomInventory.findOne({
            where: { roomBranchId: booking.branchRoomId, roomNumber },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if(!room) {
            throw new ApiError(`La habitacion ${roomNumber} no existe o no corresponde al tipo de habitacion y sede de la reserva.`, "RESOURCE_NOT_FOUND");
        }
        if(!room.active || room.status !== ROOM_STATUS.DSPN) {
            throw new ApiError(`La habitacion ${roomNumber} no esta disponible (estado: "${room.status}"${room.active ? '' : ', inactiva'}).`, "RESOURCE_CONFLICT");
        }

        const checkIn = await CheckIn.create({
            bookingId,
            roomInventoryId: room.id,
            checkInDate: today,
            observations: observations ?? null,
            status: CHECK_IN_STATUS.COMPLETADO
        }, { transaction });
        await CheckInPet.bulkCreate(checkInPetRows(checkIn.id), { transaction, validate: true });

        await room.update({ status: ROOM_STATUS.OCDA }, { transaction });
        await booking.update({ bookingStatus: BOOKING_STATUS.ENES }, { transaction });

        return checkIn;
    });

    return withDetails(newCheckIn);
}

const getAvailableRoomsForBooking = async (bookingId) => {
    const booking = await Booking.findByPk(bookingId);
    if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");

    return await RoomInventory.findAll({
        where: {
            roomBranchId: booking.branchRoomId,
            status: ROOM_STATUS.DSPN,
            active: true
        },
        order: [['roomNumber', 'ASC']]
    });
}

const getPetsForBooking = async (bookingId) => {
    const booking = await Booking.findByPk(bookingId);
    if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");

    return await BookingPet.findAll({
        where: { bookingId },
        include: [{
            model: Pet,
            paranoid: false,
            include: [{ model: PetVaccine }]
        }],
        order: [['id', 'ASC'], [Pet, PetVaccine, 'dateOfPlacement', 'DESC']]
    });
}

const getById = async (id) => {
    const checkIn = await withDetails({ id });
    if(!checkIn) throw new ApiError(`El check-in con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return checkIn;
}

const getByBooking = async (bookingId) => {
    const checkIn = await CheckIn.findOne({ where: { bookingId } });
    if(!checkIn) throw new ApiError(`La reserva con el ID ${bookingId} no tiene un check-in registrado.`, "RESOURCE_NOT_FOUND");
    return withDetails(checkIn);
}

const getAll = async () => {
    return await CheckIn.findAll({
        include: [
            { model: CheckInPet, include: [{ model: BookingPet }] },
            { model: RoomInventory }
        ]
    });
}

module.exports = { create, getAvailableRoomsForBooking, getPetsForBooking, getById, getByBooking, getAll };
