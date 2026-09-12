const dbConnection = require('../../shared/utils/index.js');
const Pet = dbConnection.Pet;
const Customer = dbConnection.Customer;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createPetDTO) => {
    const { customerId } = createPetDTO;

    const customerExists = await Customer.findByPk(customerId);
    if(!customerExists) throw new ApiError(`El cliente con el ID ${customerId} no existe.`, "RESOURCE_NOT_FOUND");

    const newPet = await Pet.create(createPetDTO);
    return newPet;
}

const update = async (id, updatePetDTO) => {
    const pet = await Pet.findByPk(id);
    if(!pet) throw new ApiError(`La mascota con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await pet.update(updatePetDTO);
    return pet;
}

const remove = async (id) => {
    const pet = await Pet.findByPk(id);
    if(!pet) throw new ApiError(`La mascota con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await pet.destroy();
    return pet;
}

const restore = async (id) => {
    const pet = await Pet.findOne({
        where: { id },
        paranoid: false
    });
    if(!pet) throw new ApiError(`La mascota con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await pet.restore();
    return pet;
}

const getById = async (id) => {
    const pet = await Pet.findByPk(id);
    if(!pet) throw new ApiError(`La mascota con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return pet;
}

const getAll = async () => {
    const pets = await Pet.findAll();
    return pets;
}

const getAllByCustomer = async (customerId) => {
    const customerExists = await Customer.findByPk(customerId);
    if(!customerExists) throw new ApiError(`El cliente con el ID ${customerId} no existe.`, "RESOURCE_NOT_FOUND");

    const pets = await Pet.findAll({ where: { customerId } });
    return pets;
}

module.exports = { create, update, remove, restore, getById, getAll, getAllByCustomer };
