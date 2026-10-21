const dbConnection = require('../../shared/utils/index.js');
const RoomInventory = dbConnection.RoomInventory;
const RoomBranch = dbConnection.RoomBranch;
const RoomType = dbConnection.RoomType;
const sequelize = dbConnection.sequelize;
const Op = dbConnection.Sequelize.Op;
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

        // El cupo (maximumQuantity) solo considera habitaciones no archivadas: las
        // archivadas no ocupan espacio.
        const currentCount = await RoomInventory.count({
            where: { roomBranchId: roomBranch.id },
            transaction
        });

        // El consecutivo, en cambio, parte del numero mas alto ya usado en la
        // RoomBranch, incluyendo archivadas: siguen en la tabla y el indice
        // unico (room_branch_id, room_number) las considera.
        const existingRooms = await RoomInventory.findAll({
            where: { roomBranchId: roomBranch.id },
            attributes: ['roomNumber'],
            paranoid: false,
            transaction
        });
        const lastConsecutive = existingRooms.reduce((max, room) => {
            const match = /(\d+)$/.exec(room.roomNumber);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);

        if(currentCount + quantity > roomBranch.maximumQuantity) {
            const availableSlots = Math.max(roomBranch.maximumQuantity - currentCount, 0);
            throw new ApiError(`No se pueden generar ${quantity} habitaciones: solo quedan ${availableSlots} espacio(s) disponible(s) de un maximo de ${roomBranch.maximumQuantity} para esta sede y tipo de habitacion.`, "RESOURCE_CONFLICT");
        }

        // padStart no recorta: si el consecutivo excede el relleno (ej. maximo 9
        // y siguiente 10) el numero simplemente queda con mas digitos (STD10).
        const padLength = String(roomBranch.maximumQuantity).length;
        const roomsToCreate = [];
        for(let i = 1; i <= quantity; i++) {
            const consecutive = lastConsecutive + i;
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

// Como las archivadas no ocupan cupo, restaurar puede exceder maximumQuantity
// si mientras tanto se generaron otras: se valida bajo el mismo lock de
// RoomBranch que usa generateBulk.
const restore = async (id) => {
    return await sequelize.transaction(async (transaction) => {
        const room = await RoomInventory.findOne({
            where: { id },
            paranoid: false,
            transaction
        });
        if(!room) throw new ApiError(`La habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
        if(room.archivadoEn === null) return room;

        const roomBranch = await RoomBranch.findByPk(room.roomBranchId, {
            paranoid: false,
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        const currentCount = await RoomInventory.count({
            where: { roomBranchId: room.roomBranchId },
            transaction
        });
        if(roomBranch && currentCount >= roomBranch.maximumQuantity) {
            throw new ApiError(`No se puede restaurar la habitacion ${room.roomNumber}: la sede ya tiene ${currentCount} de un maximo de ${roomBranch.maximumQuantity} habitaciones no archivadas para este tipo de habitacion.`, "RESOURCE_CONFLICT");
        }

        await room.restore({ transaction });
        return room;
    });
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

// Solo habitaciones archivadas (soft delete), opcionalmente filtradas por
// RoomBranch, para poder obtener el id que pide restore.
const getArchived = async (roomBranchId) => {
    const where = { archivadoEn: { [Op.ne]: null } };
    if(roomBranchId !== undefined) {
        const roomBranchExists = await RoomBranch.findByPk(roomBranchId, { paranoid: false });
        if(!roomBranchExists) throw new ApiError(`La configuracion de habitaciones con el ID ${roomBranchId} no existe.`, "RESOURCE_NOT_FOUND");
        where.roomBranchId = roomBranchId;
    }

    const rooms = await RoomInventory.findAll({
        where,
        paranoid: false,
        order: [['archivadoEn', 'DESC']]
    });
    return rooms;
}

module.exports = { generateBulk, update, remove, restore, getById, getAll, getAllByRoomBranch, getArchived };
