const branchService = require('./branch.service.js');
const CreateBranchDTO = require('./DTOs/create-branch.js');
const UpdateBranchDTO = require('./DTOs/update-branch.js');
const BranchResponseDTO = require('./DTOs/branch-response.js');

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateBranchDTO.parse(req.body);
        const newBranch = await branchService.create(requestDTO);
        const responseDTO = BranchResponseDTO.parse({
            id: newBranch.id,
            cityId: newBranch.cityId,
            branchName: newBranch.branchName,
            addressLineOne: newBranch.addressLineOne,
            addressLineTwo: newBranch.addressLineTwo
        });
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Sede creada exitosamente.",
            branch: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateBranchDTO.parse(req.body);
        const updatedBranch = await branchService.update(id, requestDTO);
        const responseDTO = BranchResponseDTO.parse({
            id: updatedBranch.id,
            cityId: updatedBranch.cityId,
            branchName: updatedBranch.branchName,
            addressLineOne: updatedBranch.addressLineOne,
            addressLineTwo: updatedBranch.addressLineTwo
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Sede actualizada exitosamente.",
            branch: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedBranch = await branchService.remove(id);
        const responseDTO = BranchResponseDTO.parse({
            id: removedBranch.id,
            cityId: removedBranch.cityId,
            branchName: removedBranch.branchName,
            addressLineOne: removedBranch.addressLineOne,
            addressLineTwo: removedBranch.addressLineTwo
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Sede eliminada exitosamente.",
            branch: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredBranch = await branchService.restore(id);
        const responseDTO = BranchResponseDTO.parse({
            id: restoredBranch.id,
            cityId: restoredBranch.cityId,
            branchName: restoredBranch.branchName,
            addressLineOne: restoredBranch.addressLineOne,
            addressLineTwo: restoredBranch.addressLineTwo
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Sede restaurada exitosamente.",
            branch: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const branch = await branchService.getById(id);
        const responseDTO = BranchResponseDTO.parse({
            id: branch.id,
            cityId: branch.cityId,
            branchName: branch.branchName,
            addressLineOne: branch.addressLineOne,
            addressLineTwo: branch.addressLineTwo
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Sede encontrada exitosamente.",
            branch: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const branches = await branchService.getAll();
        const responseDTO = branches.map(b => BranchResponseDTO.parse({
            id: b.id,
            cityId: b.cityId,
            branchName: b.branchName,
            addressLineOne: b.addressLineOne,
            addressLineTwo: b.addressLineTwo
        }));
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Sedes obtenidas exitosamente.",
            branches: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll };
