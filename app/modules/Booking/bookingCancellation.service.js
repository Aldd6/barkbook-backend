const dbConnection = require('../../shared/utils/index.js');
const Booking = dbConnection.Booking;
const BookingPet = dbConnection.BookingPet;
const BookingBill = dbConnection.BookingBill;
const BookingCancellation = dbConnection.BookingCancellation;
const RoomBranch = dbConnection.RoomBranch;
const Employee = dbConnection.Employee;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');
const { BOOKING_STATUS, CANCELLATION_STATUS } = require('../../shared/constants/enums.js');
const { ADMIN_ROLE_NAME } = require('../../shared/middlewares/authorize.js');
const bookingService = require('./booking.service.js');

const CANCELLABLE_STATUSES = [BOOKING_STATUS.PDCN, BOOKING_STATUS.CNFD];

const bookingDetails = [{ model: BookingPet }, { model: BookingBill }];

const branchOfBooking = async (booking, transaction) => {
    const roomBranch = await RoomBranch.findByPk(booking.branchRoomId, { paranoid: false, transaction });
    return roomBranch?.branchId ?? null;
}

const resolveStaffBranchId = async (user) => {
    if(user.roleName === ADMIN_ROLE_NAME) return null;
    const employee = await Employee.findOne({ where: { userId: user.id } });
    if(!employee) throw new ApiError('Su usuario no esta vinculado a un perfil de empleado con sede asignada.', "UNAUTHORIZED_ACCESS");
    return employee.branchId;
}

const assertSameBranch = (staffBranchId, bookingBranchId) => {
    if(staffBranchId !== null && staffBranchId !== bookingBranchId) {
        throw new ApiError('Solo el personal de la sede de la reserva puede resolver esta solicitud de cancelacion.', "UNAUTHORIZED_ACCESS");
    }
}

const create = async ({ bookingId, reason }, user) => {
    return await sequelize.transaction(async (transaction) => {
        const booking = await Booking.findByPk(bookingId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
        if(!CANCELLABLE_STATUSES.includes(booking.bookingStatus)) {
            throw new ApiError(`Solo se puede solicitar la cancelacion de una reserva confirmada o pendiente de confirmar. Estado actual: "${booking.bookingStatus}".`, "RESOURCE_CONFLICT");
        }

        const pending = await BookingCancellation.findOne({
            where: { bookingId, status: CANCELLATION_STATUS.PENDIENTE },
            transaction
        });
        if(pending) throw new ApiError(`La reserva #${bookingId} ya tiene una solicitud de cancelacion pendiente.`, "RESOURCE_CONFLICT");

        const cancellation = await BookingCancellation.create({
            bookingId,
            reason,
            requestedByUserId: user.id
        }, { transaction });
        cancellation.branchId = await branchOfBooking(booking, transaction);
        return cancellation;
    });
}

const getAll = async ({ status }, user) => {
    const staffBranchId = await resolveStaffBranchId(user);
    const cancellations = await BookingCancellation.findAll({
        where: status ? { status } : undefined,
        include: [{
            model: Booking,
            required: true,
            include: [
                ...bookingDetails,
                {
                    model: RoomBranch,
                    required: true,
                    paranoid: false,
                    where: staffBranchId === null ? undefined : { branchId: staffBranchId }
                }
            ]
        }],
        order: [['creadoEn', 'DESC']]
    });
    cancellations.forEach(cancellation => { cancellation.branchId = cancellation.Booking.RoomBranch.branchId; });
    return cancellations;
}

const getByBooking = async (bookingId) => {
    const booking = await Booking.findByPk(bookingId);
    if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
    const branchId = await branchOfBooking(booking);
    const cancellations = await BookingCancellation.findAll({ where: { bookingId }, order: [['creadoEn', 'DESC']] });
    cancellations.forEach(cancellation => { cancellation.branchId = branchId; });
    return cancellations;
}

const lockPendingRequest = async (id, user, transaction) => {
    const staffBranchId = await resolveStaffBranchId(user);
    const cancellation = await BookingCancellation.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if(!cancellation) throw new ApiError(`La solicitud de cancelacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    if(cancellation.status !== CANCELLATION_STATUS.PENDIENTE) {
        throw new ApiError(`La solicitud de cancelacion #${id} ya fue resuelta (estado: "${cancellation.status}").`, "RESOURCE_CONFLICT");
    }

    const booking = await Booking.findByPk(cancellation.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
    if(!booking) throw new ApiError(`La reserva con el ID ${cancellation.bookingId} no existe.`, "RESOURCE_NOT_FOUND");
    const branchId = await branchOfBooking(booking, transaction);
    assertSameBranch(staffBranchId, branchId);

    cancellation.branchId = branchId;
    return { cancellation, booking };
}

const approve = async (id, { resolutionNotes }, user) => {
    const result = await sequelize.transaction(async (transaction) => {
        const { cancellation, booking } = await lockPendingRequest(id, user, transaction);
        let refunds = [];

        if(booking.bookingStatus === BOOKING_STATUS.CNCL) {
            resolutionNotes = resolutionNotes || 'La reserva ya se encontraba cancelada.';
        } else {
            if(!CANCELLABLE_STATUSES.includes(booking.bookingStatus)) {
                throw new ApiError(`La reserva #${booking.id} ya no puede cancelarse (estado: "${booking.bookingStatus}"). Rechace la solicitud indicando el motivo.`, "RESOURCE_CONFLICT");
            }
            await booking.update({
                bookingStatus: BOOKING_STATUS.CNCL,
                cancellationReason: `Cancelada a solicitud del cliente: ${cancellation.reason}`.slice(0, 255)
            }, { transaction });
            refunds = await bookingService.refundBookingPayments(booking, transaction, 'Reembolso por cancelacion solicitada por el cliente');
        }

        await cancellation.update({
            status: CANCELLATION_STATUS.APROBADA,
            resolvedByUserId: user.id,
            resolutionNotes: resolutionNotes || null,
            resolvedAt: new Date()
        }, { transaction });

        return { cancellation, bookingId: booking.id, refunds };
    });

    const booking = await Booking.findByPk(result.bookingId, { include: bookingDetails });
    return { cancellation: result.cancellation, booking, refunds: result.refunds };
}

const reject = async (id, { resolutionNotes }, user) => {
    return await sequelize.transaction(async (transaction) => {
        const { cancellation } = await lockPendingRequest(id, user, transaction);
        await cancellation.update({
            status: CANCELLATION_STATUS.RECHAZADA,
            resolvedByUserId: user.id,
            resolutionNotes,
            resolvedAt: new Date()
        }, { transaction });
        return cancellation;
    });
}

module.exports = { create, getAll, getByBooking, approve, reject, resolveStaffBranchId };
