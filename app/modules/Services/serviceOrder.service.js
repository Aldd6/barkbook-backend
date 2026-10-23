const dbConnection = require('../../shared/utils/index.js');
const ServiceOrder = dbConnection.ServiceOrder;
const ServiceOrderPet = dbConnection.ServiceOrderPet;
const Service = dbConnection.Service;
const ServiceBranch = dbConnection.ServiceBranch;
const Booking = dbConnection.Booking;
const BookingPet = dbConnection.BookingPet;
const BookingBill = dbConnection.BookingBill;
const CheckIn = dbConnection.CheckIn;
const CheckInPet = dbConnection.CheckInPet;
const RoomBranch = dbConnection.RoomBranch;
const Pet = dbConnection.Pet;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');
const { BOOKING_STATUS, CHECK_IN_STATUS, MOVEMENT_TYPE, SERVICE_ORDER_STATUS } = require('../../shared/constants/enums.js');
const { CUSTOMER_ROLE_NAME } = require('../../shared/middlewares/ownership.js');
const { resolveStaffBranchId } = require('../Booking/bookingCancellation.service.js');

const roundMoney = (value) => Math.round(value * 100) / 100;

const sumByMovement = (bills, movementType) => bills
    .filter(bill => bill.movementType === movementType)
    .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

const orderDetails = (staffBranchId = null) => [
    { model: Service, paranoid: false },
    { model: ServiceOrderPet, include: [{ model: Pet, paranoid: false, attributes: ['id', 'name'] }] },
    {
        model: Booking,
        required: true,
        attributes: ['id', 'branchRoomId'],
        include: [{
            model: RoomBranch,
            required: true,
            paranoid: false,
            attributes: ['id', 'branchId'],
            where: staffBranchId === null ? undefined : { branchId: staffBranchId }
        }]
    }
];

const findWithDetails = (ids) => ServiceOrder.findAll({
    where: { id: ids },
    include: orderDetails(),
    order: [['id', 'ASC']]
});

const assertSameBranch = (staffBranchId, bookingBranchId) => {
    if(staffBranchId !== null && staffBranchId !== bookingBranchId) {
        throw new ApiError('Solo el personal de la sede de la reserva puede atender esta orden de servicio.', "UNAUTHORIZED_ACCESS");
    }
}

const lockPendingOrder = async (id, user, transaction) => {
    const staffBranchId = user.roleName === CUSTOMER_ROLE_NAME ? null : await resolveStaffBranchId(user);

    const order = await ServiceOrder.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if(!order) throw new ApiError(`La orden de servicio con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    if(order.status !== SERVICE_ORDER_STATUS.PENDIENTE) {
        throw new ApiError(`La orden de servicio #${id} ya fue atendida (estado: "${order.status}").`, "RESOURCE_CONFLICT");
    }

    const booking = await Booking.findByPk(order.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
    if(!booking) throw new ApiError(`La reserva con el ID ${order.bookingId} no existe.`, "RESOURCE_NOT_FOUND");
    if(booking.bookingStatus !== BOOKING_STATUS.ENES) {
        throw new ApiError(`La reserva #${booking.id} ya no esta en estancia (estado: "${booking.bookingStatus}").`, "RESOURCE_CONFLICT");
    }

    const roomBranch = await RoomBranch.findByPk(booking.branchRoomId, { transaction, paranoid: false });
    assertSameBranch(staffBranchId, roomBranch?.branchId ?? null);

    return { order, booking };
}

const create = async (bookingId, createServiceOrderDTO, user) => {
    const { serviceId, petIds, description } = createServiceOrderDTO;

    const orderIds = await sequelize.transaction(async (transaction) => {
        const booking = await Booking.findByPk(bookingId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
        if(booking.bookingStatus !== BOOKING_STATUS.ENES) {
            throw new ApiError(`Solo se pueden contratar servicios para una reserva en estado "${BOOKING_STATUS.ENES}". Estado actual: "${booking.bookingStatus}".`, "RESOURCE_CONFLICT");
        }

        const service = await Service.findByPk(serviceId, { transaction });
        if(!service) throw new ApiError(`El servicio con el ID ${serviceId} no existe.`, "RESOURCE_NOT_FOUND");

        const roomBranch = await RoomBranch.findByPk(booking.branchRoomId, { transaction, paranoid: false });
        if(!roomBranch) throw new ApiError(`La configuracion de habitaciones de la reserva #${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
        const offeredAtBranch = await ServiceBranch.findOne({
            where: { branchId: roomBranch.branchId, serviceId },
            transaction
        });
        if(!offeredAtBranch) {
            throw new ApiError(`El servicio "${service.name}" no se presta en la sede de la reserva #${bookingId}.`, "RESOURCE_CONFLICT");
        }

        const checkIn = await CheckIn.findOne({
            where: { bookingId, status: CHECK_IN_STATUS.COMPLETADO },
            include: [{
                model: CheckInPet,
                where: { admitted: true },
                required: false,
                include: [{ model: BookingPet, include: [{ model: Pet, paranoid: false }] }]
            }],
            transaction
        });
        const admittedPets = (checkIn?.CheckInPets || []).map(checkInPet => checkInPet.BookingPet.Pet);
        if(admittedPets.length === 0) {
            throw new ApiError(`La reserva #${bookingId} no tiene mascotas admitidas en su check-in.`, "RESOURCE_CONFLICT");
        }

        let servedPets = admittedPets;
        if(petIds) {
            const uniquePetIds = [...new Set(petIds)];
            servedPets = admittedPets.filter(pet => uniquePetIds.includes(pet.id));
            if(servedPets.length !== uniquePetIds.length) {
                throw new ApiError(`Una o mas mascotas no estan admitidas en la estancia de la reserva #${bookingId}.`, "INVALID_INPUT");
            }
        }

        if(service.speciesType) {
            const wrongSpecies = servedPets.filter(pet => pet.species !== service.speciesType);
            if(wrongSpecies.length > 0) {
                throw new ApiError(`El servicio "${service.name}" solo aplica a la especie ${service.speciesType}; no se puede contratar para: ${wrongSpecies.map(pet => pet.name).join(', ')}.`, "INVALID_INPUT");
            }
        }

        const petGroups = service.isMultiGuest ? [servedPets] : servedPets.map(pet => [pet]);
        const ids = [];
        for(const pets of petGroups) {
            const order = await ServiceOrder.create({
                bookingId: booking.id,
                serviceId: service.id,
                amount: service.rate,
                description: description || null,
                requestedByUserId: user.id
            }, { transaction });
            await ServiceOrderPet.bulkCreate(
                pets.map(pet => ({ serviceOrderId: order.id, petId: pet.id })),
                { transaction, validate: true }
            );
            ids.push(order.id);
        }
        return ids;
    });

    return findWithDetails(orderIds);
}

const getAll = async ({ status }, user) => {
    const staffBranchId = await resolveStaffBranchId(user);
    return await ServiceOrder.findAll({
        where: status ? { status } : undefined,
        include: orderDetails(staffBranchId),
        order: [['creadoEn', 'ASC']]
    });
}

const getByBooking = async (bookingId) => {
    const booking = await Booking.findByPk(bookingId);
    if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
    return await ServiceOrder.findAll({
        where: { bookingId },
        include: orderDetails(),
        order: [['creadoEn', 'ASC']]
    });
}

const complete = async (id, { resolutionNotes }, user) => {
    const result = await sequelize.transaction(async (transaction) => {
        const { order, booking } = await lockPendingOrder(id, user, transaction);

        const service = await Service.findByPk(order.serviceId, { transaction, paranoid: false });
        const orderPets = await ServiceOrderPet.findAll({
            where: { serviceOrderId: order.id },
            include: [{ model: Pet, paranoid: false, attributes: ['name'] }],
            transaction
        });
        const petNames = orderPets.map(orderPet => orderPet.Pet?.name).filter(Boolean).join(', ');

        const bill = await BookingBill.create({
            bookingId: booking.id,
            serviceId: order.serviceId,
            quantity: 1,
            movementType: MOVEMENT_TYPE.CARGO,
            amount: order.amount,
            methodPayment: null,
            reference: null,
            description: `Cargo por servicio "${service?.name ?? order.serviceId}" (orden #${order.id}) - Reserva #${booking.id}. Mascota(s): ${petNames}.`.slice(0, 255)
        }, { transaction });

        await order.update({
            status: SERVICE_ORDER_STATUS.COMPLETADO,
            resolvedByUserId: user.id,
            resolutionNotes: resolutionNotes || null,
            resolvedAt: new Date(),
            bookingBillId: bill.id
        }, { transaction });

        const bills = await BookingBill.findAll({ where: { bookingId: booking.id }, transaction });
        const balance = roundMoney(sumByMovement(bills, MOVEMENT_TYPE.CARGO) - sumByMovement(bills, MOVEMENT_TYPE.ABONO));

        return { orderId: order.id, bill, balance };
    });

    const [order] = await findWithDetails([result.orderId]);
    return { order, bill: result.bill, balance: result.balance };
}

const cancel = async (id, { resolutionNotes }, user) => {
    const orderId = await sequelize.transaction(async (transaction) => {
        const { order } = await lockPendingOrder(id, user, transaction);
        await order.update({
            status: SERVICE_ORDER_STATUS.CANCELADO,
            resolvedByUserId: user.id,
            resolutionNotes,
            resolvedAt: new Date()
        }, { transaction });
        return order.id;
    });

    const [order] = await findWithDetails([orderId]);
    return order;
}

module.exports = { create, getAll, getByBooking, complete, cancel };
