const roomBranchService = require('./roomBranch.service.js');
const CreateRoomBranchDTO = require('./DTOs/create-room-branch.js');
const UpdateRoomBranchDTO = require('./DTOs/update-room-branch.js');
const RoomBranchResponseDTO = require('./DTOs/room-branch-response.js');

const toResponseDTO = (roomBranch) => RoomBranchResponseDTO.parse({
    id: roomBranch.id,
    branchId: roomBranch.branchId,
    roomTypeId: roomBranch.roomTypeId,
    maximumQuantity: roomBranch.maximumQuantity
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateRoomBranchDTO.parse(req.body);
        const newRoomBranch = await roomBranchService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Configuracion de habitaciones creada exitosamente.",
            roomBranch: toResponseDTO(newRoomBranch)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateRoomBranchDTO.parse(req.body);
        const updatedRoomBranch = await roomBranchService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Configuracion de habitaciones actualizada exitosamente.",
            roomBranch: toResponseDTO(updatedRoomBranch)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedRoomBranch = await roomBranchService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Configuracion de habitaciones eliminada exitosamente.",
            roomBranch: toResponseDTO(removedRoomBranch)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredRoomBranch = await roomBranchService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Configuracion de habitaciones restaurada exitosamente.",
            roomBranch: toResponseDTO(restoredRoomBranch)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const roomBranch = await roomBranchService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Configuracion de habitaciones encontrada exitosamente.",
            roomBranch: toResponseDTO(roomBranch)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const roomBranches = await roomBranchService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Configuraciones de habitaciones obtenidas exitosamente.",
            roomBranches: roomBranches.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByBranch = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const roomBranches = await roomBranchService.getAllByBranch(branchId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Configuraciones de habitaciones de la sede obtenidas exitosamente.",
            roomBranches: roomBranches.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, getAllByBranch };
