const dbConnection = require('../../shared/utils/index.js');
const PetDiet = dbConnection.PetDiet;
const Pet = dbConnection.Pet;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createPetDietDTO) => {
    const { petId, activeDiet } = createPetDietDTO;

    const petExists = await Pet.findByPk(petId);
    if(!petExists) throw new ApiError(`La mascota con el ID ${petId} no existe.`, "RESOURCE_NOT_FOUND");

    const newDiet = await sequelize.transaction(async (transaction) => {
        if(activeDiet) {
            await PetDiet.update(
                { activeDiet: false },
                { where: { petId, activeDiet: true }, transaction }
            );
        }
        return await PetDiet.create(createPetDietDTO, { transaction });
    });

    return newDiet;
}

// unicamente: activeDiet se cambia solo por activateDiet/deactivateDiet.
const update = async (id, updatePetDietDTO) => {
    const diet = await PetDiet.findByPk(id);
    if(!diet) throw new ApiError(`La dieta con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await diet.update(updatePetDietDTO);
    return diet;
}

const remove = async (id) => {
    const diet = await PetDiet.findByPk(id);
    if(!diet) throw new ApiError(`La dieta con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await diet.destroy();
    return diet;
}

const restore = async (id) => {
    const diet = await PetDiet.findOne({
        where: { id },
        paranoid: false
    });
    if(!diet) throw new ApiError(`La dieta con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await diet.restore();
    return diet;
}

const getById = async (id) => {
    const diet = await PetDiet.findByPk(id);
    if(!diet) throw new ApiError(`La dieta con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return diet;
}

const getAll = async () => {
    const diets = await PetDiet.findAll();
    return diets;
}

const getAllByPet = async (petId) => {
    const petExists = await Pet.findByPk(petId);
    if(!petExists) throw new ApiError(`La mascota con el ID ${petId} no existe.`, "RESOURCE_NOT_FOUND");

    const diets = await PetDiet.findAll({ where: { petId } });
    return diets;
}

// Unica forma de activar una dieta: desactiva cualquier otra dieta activa de
// la misma mascota y activa esta, todo en una transaccion. Es la garantia de
// aplicacion de "una sola dieta activa por mascota"; el indice unico parcial
// definido en petDiet.model.js es la garantia a nivel de base de datos.
const activateDiet = async (id) => {
    const diet = await PetDiet.findByPk(id);
    if(!diet) throw new ApiError(`La dieta con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await sequelize.transaction(async (transaction) => {
        await PetDiet.update(
            { activeDiet: false },
            { where: { petId: diet.petId, activeDiet: true }, transaction }
        );
        await diet.update({ activeDiet: true }, { transaction });
    });

    return diet;
}

const deactivateDiet = async (id) => {
    const diet = await PetDiet.findByPk(id);
    if(!diet) throw new ApiError(`La dieta con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await diet.update({ activeDiet: false });
    return diet;
}

module.exports = { create, update, remove, restore, getById, getAll, getAllByPet, activateDiet, deactivateDiet };
