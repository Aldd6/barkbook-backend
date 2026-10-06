const dbConnection = require('../../shared/utils/index.js');
const ServiceBranch = dbConnection.ServiceBranch;
const Service = dbConnection.Service;
const Branch = dbConnection.Branch;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createServiceBranchDTO) => {
    const { branchId, serviceId } = createServiceBranchDTO;

    const branchExists = await Branch.findByPk(branchId);
    if(!branchExists) throw new ApiError(`La sede con el ID ${branchId} no existe.`, "RESOURCE_NOT_FOUND");

    const serviceExists = await Service.findByPk(serviceId);
    if(!serviceExists) throw new ApiError(`El servicio con el ID ${serviceId} no existe.`, "RESOURCE_NOT_FOUND");

    // El indice unico (branch_id, service_id) incluye las filas archivadas: si
    // la sede ya presto el servicio antes, se restaura en vez de crear otra fila.
    const existing = await ServiceBranch.findOne({ where: { branchId, serviceId }, paranoid: false });
    if(existing) {
        if(!existing.deletedAt) throw new ApiError(`La sede con el ID ${branchId} ya presta el servicio con el ID ${serviceId}.`, "RESOURCE_CONFLICT");
        await existing.restore();
        return existing;
    }

    const newServiceBranch = await ServiceBranch.create({ branchId, serviceId });
    return newServiceBranch;
}

const remove = async (id) => {
    const serviceBranch = await ServiceBranch.findByPk(id);
    if(!serviceBranch) throw new ApiError(`La asignacion de servicio a sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await serviceBranch.destroy();
    return serviceBranch;
}

const restore = async (id) => {
    const serviceBranch = await ServiceBranch.findOne({
        where: { id },
        paranoid: false
    });
    if(!serviceBranch) throw new ApiError(`La asignacion de servicio a sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await serviceBranch.restore();
    return serviceBranch;
}

const getById = async (id) => {
    const serviceBranch = await ServiceBranch.findByPk(id, { include: [{ model: Service }] });
    if(!serviceBranch) throw new ApiError(`La asignacion de servicio a sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return serviceBranch;
}

const getAll = async () => {
    const serviceBranches = await ServiceBranch.findAll({ include: [{ model: Service }] });
    return serviceBranches;
}

// Catalogo de servicios que presta una sede. El include es required para
// ocultar asignaciones cuyo servicio fue archivado del catalogo general.
const getAllByBranch = async (branchId) => {
    const branchExists = await Branch.findByPk(branchId);
    if(!branchExists) throw new ApiError(`La sede con el ID ${branchId} no existe.`, "RESOURCE_NOT_FOUND");

    const serviceBranches = await ServiceBranch.findAll({
        where: { branchId },
        include: [{ model: Service, required: true }]
    });
    return serviceBranches;
}

module.exports = { create, remove, restore, getById, getAll, getAllByBranch };
