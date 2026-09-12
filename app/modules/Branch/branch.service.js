const dbConnection = require('../../shared/utils/index.js');
const Branch = dbConnection.Branch;
const City = dbConnection.City;
const { ApiError } = require('../../shared/utils/errors.js');
const Op = dbConnection.Sequelize.Op;

const create = async (createBranchDTO) => {
    const { cityId, branchName, addressLineOne, addressLineTwo } = createBranchDTO;

    const cityExists = await City.findByPk(cityId);
    if(!cityExists) throw new ApiError(`El municipio con el ID ${cityId} no existe.`, "RESOURCE_NOT_FOUND");

    const branchExists = await Branch.findOne({ where: { branchName } });
    if(branchExists) throw new ApiError(`Ya existe una sede con el nombre ${branchName}.`, "RESOURCE_CONFLICT");

    const newBranch = await Branch.create({
        cityId,
        branchName,
        addressLineOne,
        addressLineTwo
    });
    return newBranch;
}

const update = async (id, updateBranchDTO) => {
    const branch = await Branch.findByPk(id);
    if(!branch) throw new ApiError(`La sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    if(updateBranchDTO.cityId) {
        const cityExists = await City.findByPk(updateBranchDTO.cityId);
        if(!cityExists) throw new ApiError(`El municipio con el ID ${updateBranchDTO.cityId} no existe.`, "RESOURCE_NOT_FOUND");
    }

    if(updateBranchDTO.branchName && updateBranchDTO.branchName !== branch.branchName) {
        const branchExists = await Branch.findOne({
            where: {
                branchName: updateBranchDTO.branchName,
                id: { [Op.ne]: id }
            }
        });
        if(branchExists) throw new ApiError(`Ya existe una sede con el nombre ${updateBranchDTO.branchName}.`, "RESOURCE_CONFLICT");
    }

    await branch.update(updateBranchDTO);
    return branch;
}

const remove = async (id) => {
    const branch = await Branch.findByPk(id);
    if(!branch) throw new ApiError(`La sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await branch.destroy();
    return branch;
}

const restore = async (id) => {
    const branch = await Branch.findOne({
        where: { id },
        paranoid: false
    });
    if(!branch) throw new ApiError(`La sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await branch.restore();
    return branch;
}

const getById = async (id) => {
    const branch = await Branch.findByPk(id);
    if(!branch) throw new ApiError(`La sede con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return branch;
}

const getAll = async () => {
    const branches = await Branch.findAll();
    return branches;
}

module.exports = { create, update, remove, restore, getById, getAll };
