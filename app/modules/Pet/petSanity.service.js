const dbConnection = require('../../shared/utils/index.js');
const PetSanity = dbConnection.PetSanity;
const Pet = dbConnection.Pet;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createPetSanityDTO) => {
    const { petId } = createPetSanityDTO;

    const petExists = await Pet.findByPk(petId);
    if(!petExists) throw new ApiError(`La mascota con el ID ${petId} no existe.`, "RESOURCE_NOT_FOUND");

    const newSanity = await PetSanity.create(createPetSanityDTO);
    return newSanity;
}

const update = async (id, updatePetSanityDTO) => {
    const sanity = await PetSanity.findByPk(id);
    if(!sanity) throw new ApiError(`El registro de sanidad con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    const effectiveSufferedSince = updatePetSanityDTO.sufferedSince ?? sanity.sufferedSince;
    const effectiveEnduredUntil = 'enduredUntil' in updatePetSanityDTO ? updatePetSanityDTO.enduredUntil : sanity.enduredUntil;

    if(effectiveEnduredUntil && effectiveEnduredUntil < effectiveSufferedSince) {
        throw new ApiError("La fecha en que finalizo la enfermedad no puede ser anterior a la fecha en que inicio.", "INVALID_INPUT");
    }

    await sanity.update(updatePetSanityDTO);
    return sanity;
}

const remove = async (id) => {
    const sanity = await PetSanity.findByPk(id);
    if(!sanity) throw new ApiError(`El registro de sanidad con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await sanity.destroy();
    return sanity;
}

const restore = async (id) => {
    const sanity = await PetSanity.findOne({
        where: { id },
        paranoid: false
    });
    if(!sanity) throw new ApiError(`El registro de sanidad con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await sanity.restore();
    return sanity;
}

const getById = async (id) => {
    const sanity = await PetSanity.findByPk(id);
    if(!sanity) throw new ApiError(`El registro de sanidad con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return sanity;
}

const getAll = async () => {
    const sanities = await PetSanity.findAll();
    return sanities;
}

const getAllByPet = async (petId) => {
    const petExists = await Pet.findByPk(petId);
    if(!petExists) throw new ApiError(`La mascota con el ID ${petId} no existe.`, "RESOURCE_NOT_FOUND");

    const sanities = await PetSanity.findAll({ where: { petId } });
    return sanities;
}

module.exports = { create, update, remove, restore, getById, getAll, getAllByPet };
