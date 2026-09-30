const dbConnection = require('../../shared/utils/index.js');
const RoomInventory = dbConnection.RoomInventory;
const RoomBranch = dbConnection.RoomBranch;
const RoomType = dbConnection.RoomType;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');
const { ROOM_STATUS } = require('../../shared/constants/enums.js');

// Unica forma de crear habitaciones: en bulk, a partir de sede + tipo de
// habitacion + cantidad. Nunca se expone un create individual porque el
// numero de habitacion depende del prefijo del RoomType y de cuantas
// habitaciones ya existen para esa RoomBranch.
const generateBulk = async (generateRoomInventoryDTO) => {
    const { branchId, roomTypeId, quantity } = generateRoomInventoryDTO;

    const newRooms = await sequelize.transaction(async (transaction) => {
        // Bloquea la fila de RoomBranch durante la transaccion: si dos
        // solicitudes de generacion llegan a la vez para la misma sede+tipo,
        const roomBranch = await RoomBranch.findOne({
            where: { branchId, roomTypeId },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if(!roomBranch) throw new ApiError(`No existe una configuracion de habitaciones para la sede con el ID ${branchId} y el tipo de habitacion con el ID ${roomTypeId}.`, "RESOURCE_NOT_FOUND");

        const roomType = await RoomType.findByPk(roomTypeId, { transaction });
        if(!roomType) throw new ApiError(`El tipo de habitacion con el ID ${roomTypeId} no existe.`, "RESOURCE_NOT_FOUND");

        const currentCount = await RoomInventory.count({
            where: { roomBranchId: roomBranch.id },
            transaction
        });

        if(currentCount + quantity > roomBranch.maximumQuantity) {
            const availableSlots = Math.max(roomBranch.maximumQuantity - currentCount, 0);
            throw new ApiError(`No se pueden generar ${quantity} habitaciones: solo quedan ${availableSlots} espacio(s) disponible(s) de un maximo de ${roomBranch.maximumQuantity} para esta sede y tipo de habitacion.`, "RESOURCE_CONFLICT");
        }

        const padLength = String(roomBranch.maximumQuantity).length;
        const roomsToCreate = [];
        for(let i = 1; i <= quantity; i++) {
            const consecutive = currentCount + i;
            roomsToCreate.push({
                roomBranchId: roomBranch.id,
                roomNumber: `${roomType.prefix}${String(consecutive).padStart(padLength, '0')}`,
                status: ROOM_STATUS.DSPN,
                active: true
            });
        }

        return await RoomInventory.bulkCreate(roomsToCreate, { transaction, validate: true });
    });

    return newRooms;
}

// Solo status/active: roomBranchId y roomNumber son de solo lectura despues
// de generada la habitacion.
const update = async (id, updateRoomInventoryDTO) => {
    const room = await RoomInventory.findByPk(id);
    if(!room) throw new ApiError(`La habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await room.update(updateRoomInventoryDTO);
    return room;
}

const remove = async (id) => {
    const room = await RoomInventory.findByPk(id);
    if(!room) throw new ApiError(`La habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await room.destroy();
    return room;
}

const restore = async (id) => {
    const room = await RoomInventory.findOne({
        where: { id },
        paranoid: false
    });
    if(!room) throw new ApiError(`La habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await room.restore();
    return room;
}

const getById = async (id) => {
    const room = await RoomInventory.findByPk(id);
    if(!room) throw new ApiError(`La habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return room;
}

const getAll = async () => {
    const rooms = await RoomInventory.findAll();
    return rooms;
}

const getAllByRoomBranch = async (roomBranchId) => {
    const roomBranchExists = await RoomBranch.findByPk(roomBranchId);
    if(!roomBranchExists) throw new ApiError(`La configuracion de habitaciones con el ID ${roomBranchId} no existe.`, "RESOURCE_NOT_FOUND");

    const rooms = await RoomInventory.findAll({ where: { roomBranchId } });
    return rooms;
}

module.exports = { generateBulk, update, remove, restore, getById, getAll, getAllByRoomBranch };
