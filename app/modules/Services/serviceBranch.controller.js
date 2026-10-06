const serviceBranchService = require('./serviceBranch.service.js');
const CreateServiceBranchDTO = require('./DTOs/create-service-branch.js');
const ServiceBranchResponseDTO = require('./DTOs/service-branch-response.js');

const toResponseDTO = (serviceBranch) => ServiceBranchResponseDTO.parse({
    id: serviceBranch.id,
    branchId: serviceBranch.branchId,
    serviceId: serviceBranch.serviceId,
    service: serviceBranch.Service ? {
        id: serviceBranch.Service.id,
        name: serviceBranch.Service.name,
        description: serviceBranch.Service.description,
        serviceType: serviceBranch.Service.serviceType,
        speciesType: serviceBranch.Service.speciesType,
        isMultiGuest: serviceBranch.Service.isMultiGuest,
        rate: serviceBranch.Service.rate
    } : null
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateServiceBranchDTO.parse(req.body);
        const newServiceBranch = await serviceBranchService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Servicio asignado a la sede exitosamente.",
            serviceBranch: toResponseDTO(newServiceBranch)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedServiceBranch = await serviceBranchService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio retirado de la sede exitosamente.",
            serviceBranch: toResponseDTO(removedServiceBranch)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredServiceBranch = await serviceBranchService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio restaurado en la sede exitosamente.",
            serviceBranch: toResponseDTO(restoredServiceBranch)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const serviceBranch = await serviceBranchService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Asignacion de servicio a sede encontrada exitosamente.",
            serviceBranch: toResponseDTO(serviceBranch)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const serviceBranches = await serviceBranchService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Asignaciones de servicios a sedes obtenidas exitosamente.",
            serviceBranches: serviceBranches.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByBranch = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const serviceBranches = await serviceBranchService.getAllByBranch(branchId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicios de la sede obtenidos exitosamente.",
            serviceBranches: serviceBranches.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, remove, restore, getById, getAll, getAllByBranch };
