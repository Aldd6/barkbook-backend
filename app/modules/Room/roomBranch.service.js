const dbConnection = require('../../shared/utils/index.js');
const sequelize = dbConnection.sequelize;
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

    // El indice unico (branch_id, room_type_id) incluye las archivadas, asi que se buscan tambien.
    const existing = await RoomBranch.findOne({ where: { branchId, roomTypeId }, paranoid: false });
    if(existing && !existing.isSoftDeleted()) throw new ApiError(`La sede con el ID ${branchId} ya tiene una configuracion para el tipo de habitacion con el ID ${roomTypeId}.`, "RESOURCE_CONFLICT");

    // Si estaba archivada se restaura con el cupo nuevo. Archivar la configuracion no archiva sus
    // habitaciones, asi que el cupo no puede quedar por debajo de las vigentes (igual que en update).
    if(existing) {
        const currentCount = await RoomInventory.count({ where: { roomBranchId: existing.id } });
        if(maximumQuantity < currentCount) {
            throw new ApiError(`No se puede asignar una cantidad maxima de ${maximumQuantity}: esta configuracion estaba archivada y ya tiene ${currentCount} habitaciones generadas.`, "RESOURCE_CONFLICT");
        }
        await sequelize.transaction(async (transaction) => {
            await existing.restore({ transaction });
            await existing.update({ maximumQuantity }, { transaction });
        });
        return { roomBranch: existing, restored: true };
    }

    const newRoomBranch = await RoomBranch.create({ branchId, roomTypeId, maximumQuantity });
    return { roomBranch: newRoomBranch, restored: false };
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
