const dbConnection = require('../../shared/utils/index.js');
const PetVaccine = dbConnection.PetVaccine;
const Pet = dbConnection.Pet;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createPetVaccineDTO) => {
    const { petId } = createPetVaccineDTO;

    const petExists = await Pet.findByPk(petId);
    if(!petExists) throw new ApiError(`La mascota con el ID ${petId} no existe.`, "RESOURCE_NOT_FOUND");

    const newVaccine = await PetVaccine.create(createPetVaccineDTO);
    return newVaccine;
}

const update = async (id, updatePetVaccineDTO) => {
    const vaccine = await PetVaccine.findByPk(id);
    if(!vaccine) throw new ApiError(`El registro de vacuna con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await vaccine.update(updatePetVaccineDTO);
    return vaccine;
}

const remove = async (id) => {
    const vaccine = await PetVaccine.findByPk(id);
    if(!vaccine) throw new ApiError(`El registro de vacuna con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await vaccine.destroy();
    return vaccine;
}

const restore = async (id) => {
    const vaccine = await PetVaccine.findOne({
        where: { id },
        paranoid: false
    });
    if(!vaccine) throw new ApiError(`El registro de vacuna con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await vaccine.restore();
    return vaccine;
}

const getById = async (id) => {
    const vaccine = await PetVaccine.findByPk(id);
    if(!vaccine) throw new ApiError(`El registro de vacuna con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return vaccine;
}

const getAll = async () => {
    const vaccines = await PetVaccine.findAll();
    return vaccines;
}

const getAllByPet = async (petId) => {
    const petExists = await Pet.findByPk(petId);
    if(!petExists) throw new ApiError(`La mascota con el ID ${petId} no existe.`, "RESOURCE_NOT_FOUND");

    const vaccines = await PetVaccine.findAll({ where: { petId } });
    return vaccines;
}

module.exports = { create, update, remove, restore, getById, getAll, getAllByPet };
