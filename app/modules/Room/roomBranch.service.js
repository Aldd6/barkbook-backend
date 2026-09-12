const dbConnection = require('../../shared/utils/index.js');
const RoomBranch = dbConnection.RoomBranch;
const RoomType = dbConnection.RoomType;
const RoomInventory = dbConnection.RoomInventory;
const Branch = dbConnection.Branch;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createRoomBranchDTO) => {
    const { branchId, roomTypeId, maximumQuantity } = createRoomBranchDTO;

    const branchExists = await Branch.findByPk(branchId);
    if(!branchExists) throw new ApiError(`La sede con el ID ${branchId} no existe.`, "RESOURCE_NOT_FOUND");

    const roomTypeExists = await RoomType.findByPk(roomTypeId);
    if(!roomTypeExists) throw new ApiError(`El tipo de habitacion con el ID ${roomTypeId} no existe.`, "RESOURCE_NOT_FOUND");

    const alreadyExists = await RoomBranch.findOne({ where: { branchId, roomTypeId } });
    if(alreadyExists) throw new ApiError(`La sede con el ID ${branchId} ya tiene una configuracion para el tipo de habitacion con el ID ${roomTypeId}.`, "RESOURCE_CONFLICT");

    const newRoomBranch = await RoomBranch.create({ branchId, roomTypeId, maximumQuantity });
    return newRoomBranch;
}

const update = async (id, updateRoomBranchDTO) => {
    const roomBranch = await RoomBranch.findByPk(id);
    if(!roomBranch) throw new ApiError(`La configuracion de habitaciones con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    if(updateRoomBranchDTO.maximumQuantity !== undefined) {
        const currentCount = await RoomInventory.count({ where: { roomBranchId: id } });
        if(updateRoomBranchDTO.maximumQuantity < currentCount) {
            throw new ApiError(`No se puede reducir la cantidad maxima a ${updateRoomBranchDTO.maximumQuantity}: ya existen ${currentCount} habitaciones generadas para esta configuracion.`, "RESOURCE_CONFLICT");
        }
    }

    await roomBranch.update(updateRoomBranchDTO);
    return roomBranch;
}

const remove = async (id) => {
    const roomBranch = await RoomBranch.findByPk(id);
    if(!roomBranch) throw new ApiError(`La configuracion de habitaciones con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await roomBranch.destroy();
    return roomBranch;
}

const restore = async (id) => {
    const roomBranch = await RoomBranch.findOne({
        where: { id },
        paranoid: false
    });
    if(!roomBranch) throw new ApiError(`La configuracion de habitaciones con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await roomBranch.restore();
    return roomBranch;
}

const getById = async (id) => {
    const roomBranch = await RoomBranch.findByPk(id);
    if(!roomBranch) throw new ApiError(`La configuracion de habitaciones con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return roomBranch;
}

const getAll = async () => {
    const roomBranches = await RoomBranch.findAll();
    return roomBranches;
}

const getAllByBranch = async (branchId) => {
    const branchExists = await Branch.findByPk(branchId);
    if(!branchExists) throw new ApiError(`La sede con el ID ${branchId} no existe.`, "RESOURCE_NOT_FOUND");

    const roomBranches = await RoomBranch.findAll({ where: { branchId } });
    return roomBranches;
}

module.exports = { create, update, remove, restore, getById, getAll, getAllByBranch };
