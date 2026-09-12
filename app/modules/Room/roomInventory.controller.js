const roomInventoryService = require('./roomInventory.service.js');
const GenerateRoomInventoryDTO = require('./DTOs/generate-room-inventory.js');
const UpdateRoomInventoryDTO = require('./DTOs/update-room-inventory.js');
const RoomInventoryResponseDTO = require('./DTOs/room-inventory-response.js');

const toResponseDTO = (room) => RoomInventoryResponseDTO.parse({
    id: room.id,
    roomBranchId: room.roomBranchId,
    roomNumber: room.roomNumber,
    status: room.status,
    active: room.active
});

const generateBulk = async (req, res, next) => {
    try {
        const requestDTO = GenerateRoomInventoryDTO.parse(req.body);
        const newRooms = await roomInventoryService.generateBulk(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: `${newRooms.length} habitacion(es) generada(s) exitosamente.`,
            roomInventory: newRooms.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateRoomInventoryDTO.parse(req.body);
        const updatedRoom = await roomInventoryService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitacion actualizada exitosamente.",
            roomInventory: toResponseDTO(updatedRoom)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedRoom = await roomInventoryService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitacion eliminada exitosamente.",
            roomInventory: toResponseDTO(removedRoom)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredRoom = await roomInventoryService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitacion restaurada exitosamente.",
            roomInventory: toResponseDTO(restoredRoom)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const room = await roomInventoryService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitacion encontrada exitosamente.",
            roomInventory: toResponseDTO(room)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const rooms = await roomInventoryService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitaciones obtenidas exitosamente.",
            roomInventory: rooms.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByRoomBranch = async (req, res, next) => {
    try {
        const { roomBranchId } = req.params;
        const rooms = await roomInventoryService.getAllByRoomBranch(roomBranchId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitaciones de la configuracion obtenidas exitosamente.",
            roomInventory: rooms.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { generateBulk, update, remove, restore, getById, getAll, getAllByRoomBranch };
