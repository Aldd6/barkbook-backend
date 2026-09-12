const petSanityService = require('./petSanity.service.js');
const CreatePetSanityDTO = require('./DTOs/create-pet-sanity.js');
const UpdatePetSanityDTO = require('./DTOs/update-pet-sanity.js');
const PetSanityResponseDTO = require('./DTOs/pet-sanity-response.js');

const toResponseDTO = (sanity) => PetSanityResponseDTO.parse({
    id: sanity.id,
    petId: sanity.petId,
    illnessName: sanity.illnessName,
    isCronic: sanity.isCronic,
    isContagious: sanity.isContagious,
    sufferedSince: sanity.sufferedSince,
    enduredUntil: sanity.enduredUntil,
    isIllnessActive: sanity.isIllnessActive
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreatePetSanityDTO.parse(req.body);
        const newSanity = await petSanityService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Registro de sanidad creado exitosamente.",
            petSanity: toResponseDTO(newSanity)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdatePetSanityDTO.parse(req.body);
        const updatedSanity = await petSanityService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registro de sanidad actualizado exitosamente.",
            petSanity: toResponseDTO(updatedSanity)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedSanity = await petSanityService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registro de sanidad eliminado exitosamente.",
            petSanity: toResponseDTO(removedSanity)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredSanity = await petSanityService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registro de sanidad restaurado exitosamente.",
            petSanity: toResponseDTO(restoredSanity)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sanity = await petSanityService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registro de sanidad encontrado exitosamente.",
            petSanity: toResponseDTO(sanity)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const sanities = await petSanityService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registros de sanidad obtenidos exitosamente.",
            petSanities: sanities.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByPet = async (req, res, next) => {
    try {
        const { petId } = req.params;
        const sanities = await petSanityService.getAllByPet(petId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registros de sanidad de la mascota obtenidos exitosamente.",
            petSanities: sanities.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, getAllByPet };
