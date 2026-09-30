const dbConnection = require('../../shared/utils/index.js');
const RoomType = dbConnection.RoomType;
const { ApiError } = require('../../shared/utils/errors.js');
const Op = dbConnection.Sequelize.Op;

const create = async (createRoomTypeDTO) => {
    const { name, prefix } = createRoomTypeDTO;

    const nameExists = await RoomType.findOne({ where: { name } });
    if(nameExists) throw new ApiError(`Ya existe un tipo de habitacion con el nombre ${name}.`, "RESOURCE_CONFLICT");

    const prefixExists = await RoomType.findOne({ where: { prefix } });
    if(prefixExists) throw new ApiError(`Ya existe un tipo de habitacion con el prefijo ${prefix}.`, "RESOURCE_CONFLICT");

    const newRoomType = await RoomType.create(createRoomTypeDTO);
    return newRoomType;
}

const update = async (id, updateRoomTypeDTO) => {
    const roomType = await RoomType.findByPk(id);
    if(!roomType) throw new ApiError(`El tipo de habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    if(updateRoomTypeDTO.name && updateRoomTypeDTO.name !== roomType.name) {
        const nameExists = await RoomType.findOne({
            where: {
                name: updateRoomTypeDTO.name,
                id: { [Op.ne]: id }
            }
        });
        if(nameExists) throw new ApiError(`Ya existe un tipo de habitacion con el nombre ${updateRoomTypeDTO.name}.`, "RESOURCE_CONFLICT");
    }

    await roomType.update(updateRoomTypeDTO);
    return roomType;
}

const remove = async (id) => {
    const roomType = await RoomType.findByPk(id);
    if(!roomType) throw new ApiError(`El tipo de habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await roomType.destroy();
    return roomType;
}

const restore = async (id) => {
    const roomType = await RoomType.findOne({
        where: { id },
        paranoid: false
    });
    if(!roomType) throw new ApiError(`El tipo de habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await roomType.restore();
    return roomType;
}

const getById = async (id) => {
    const roomType = await RoomType.findByPk(id);
    if(!roomType) throw new ApiError(`El tipo de habitacion con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return roomType;
}

const getAll = async () => {
    const roomTypes = await RoomType.findAll();
    return roomTypes;
}

module.exports = { create, update, remove, restore, getById, getAll };
