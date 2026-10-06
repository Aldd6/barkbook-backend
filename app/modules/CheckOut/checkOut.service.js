const dbConnection = require('../../shared/utils/index.js');
const CheckOut = dbConnection.CheckOut;
const CheckIn = dbConnection.CheckIn;
const Booking = dbConnection.Booking;
const BookingBill = dbConnection.BookingBill;
const RoomInventory = dbConnection.RoomInventory;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');
const { BOOKING_STATUS, CHECK_IN_STATUS, MOVEMENT_TYPE, ROOM_STATUS } = require('../../shared/constants/enums.js');

const roundMoney = (value) => Math.round(value * 100) / 100;

const sumByMovement = (bills, movementType) => bills
    .filter(bill => bill.movementType === movementType)
    .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

const withDetails = (checkOut) => CheckOut.findByPk(checkOut.id, {
    include: [{ model: CheckIn, include: [{ model: RoomInventory }] }]
});

const create = async (createCheckOutDTO, userId) => {
    const { checkInId, observations } = createCheckOutDTO;

    const newCheckOut = await sequelize.transaction(async (transaction) => {
        const checkIn = await CheckIn.findByPk(checkInId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!checkIn) throw new ApiError(`El check-in con el ID ${checkInId} no existe.`, "RESOURCE_NOT_FOUND");
        if(checkIn.status !== CHECK_IN_STATUS.COMPLETADO) {
            throw new ApiError(`Solo se puede hacer check-out de un check-in en estado "${CHECK_IN_STATUS.COMPLETADO}". Estado actual: "${checkIn.status}".`, "RESOURCE_CONFLICT");
        }

        const existingCheckOut = await CheckOut.findOne({ where: { checkInId }, transaction });
        if(existingCheckOut) throw new ApiError(`El check-in con el ID ${checkInId} ya tiene un check-out registrado.`, "RESOURCE_CONFLICT");

        const booking = await Booking.findByPk(checkIn.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!booking) throw new ApiError(`La reserva con el ID ${checkIn.bookingId} no existe.`, "RESOURCE_NOT_FOUND");
        if(booking.bookingStatus !== BOOKING_STATUS.ENES) {
            throw new ApiError(`Solo se puede hacer check-out de una reserva en estado "${BOOKING_STATUS.ENES}". Estado actual: "${booking.bookingStatus}".`, "RESOURCE_CONFLICT");
        }

        // La cuenta debe estar saldada (incluye cargos agregados durante la estancia).
        const bills = await BookingBill.findAll({ where: { bookingId: booking.id }, transaction });
        const remaining = roundMoney(sumByMovement(bills, MOVEMENT_TYPE.CARGO) - sumByMovement(bills, MOVEMENT_TYPE.ABONO));
        if(remaining > 0) {
            throw new ApiError(`La reserva #${booking.id} tiene un saldo pendiente de Q${remaining.toFixed(2)}. Debe saldarse antes de realizar el check-out.`, "RESOURCE_CONFLICT");
        }

        const room = await RoomInventory.findByPk(checkIn.roomInventoryId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!room) throw new ApiError(`La habitacion asignada en el check-in con el ID ${checkInId} no existe.`, "RESOURCE_NOT_FOUND");

        const checkOut = await CheckOut.create({
            checkInId,
            checkOutDate: new Date(),
            observations: observations ?? null,
            userId: userId ?? null
        }, { transaction });

        // La habitacion no queda DISPONIBLE directamente: primero pasa por
        // limpieza y desinfeccion.
        await room.update({ status: ROOM_STATUS.LMDS }, { transaction });
        await booking.update({ bookingStatus: BOOKING_STATUS.FNLZ }, { transaction });

        return checkOut;
    });

    return withDetails(newCheckOut);
}

const getById = async (id) => {
    const checkOut = await withDetails({ id });
    if(!checkOut) throw new ApiError(`El check-out con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return checkOut;
}

const getByCheckIn = async (checkInId) => {
    const checkOut = await CheckOut.findOne({ where: { checkInId } });
    if(!checkOut) throw new ApiError(`El check-in con el ID ${checkInId} no tiene un check-out registrado.`, "RESOURCE_NOT_FOUND");
    return withDetails(checkOut);
}

const getAll = async () => {
    return await CheckOut.findAll({
        include: [{ model: CheckIn, include: [{ model: RoomInventory }] }]
    });
}

module.exports = { create, getById, getByCheckIn, getAll };
