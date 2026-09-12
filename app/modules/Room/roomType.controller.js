const roomTypeService = require('./roomType.service.js');
const CreateRoomTypeDTO = require('./DTOs/create-room-type.js');
const UpdateRoomTypeDTO = require('./DTOs/update-room-type.js');
const RoomTypeResponseDTO = require('./DTOs/room-type-response.js');

const toResponseDTO = (roomType) => RoomTypeResponseDTO.parse({
    id: roomType.id,
    name: roomType.name,
    prefix: roomType.prefix,
    speciesType: roomType.speciesType,
    isCage: roomType.isCage,
    lengthDimension: roomType.lengthDimension,
    widthDimensions: roomType.widthDimensions,
    heightDimensions: roomType.heightDimensions,
    description: roomType.description,
    hasAC: roomType.hasAC,
    isSoundproofed: roomType.isSoundproofed,
    hasCCTV: roomType.hasCCTV,
    hasOrthopedicBed: roomType.hasOrthopedicBed,
    hasPrivateYard: roomType.hasPrivateYard,
    hasSharedYard: roomType.hasSharedYard,
    hasToys: roomType.hasToys,
    maximumNumberOfGuests: roomType.maximumNumberOfGuests,
    nightlyRate: roomType.nightlyRate
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateRoomTypeDTO.parse(req.body);
        const newRoomType = await roomTypeService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Tipo de habitacion creado exitosamente.",
            roomType: toResponseDTO(newRoomType)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateRoomTypeDTO.parse(req.body);
        const updatedRoomType = await roomTypeService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Tipo de habitacion actualizado exitosamente.",
            roomType: toResponseDTO(updatedRoomType)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedRoomType = await roomTypeService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Tipo de habitacion eliminado exitosamente.",
            roomType: toResponseDTO(removedRoomType)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredRoomType = await roomTypeService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Tipo de habitacion restaurado exitosamente.",
            roomType: toResponseDTO(restoredRoomType)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const roomType = await roomTypeService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Tipo de habitacion encontrado exitosamente.",
            roomType: toResponseDTO(roomType)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const roomTypes = await roomTypeService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Tipos de habitacion obtenidos exitosamente.",
            roomTypes: roomTypes.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll };
