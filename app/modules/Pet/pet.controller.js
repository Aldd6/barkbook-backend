const petService = require('./pet.service.js');
const CreatePetDTO = require('./DTOs/create-pet.js');
const UpdatePetDTO = require('./DTOs/update-pet.js');
const PetResponseDTO = require('./DTOs/pet-response.js');
const { getFileUrl } = require('../../shared/config/s3.js');

const toResponseDTO = async (pet) => PetResponseDTO.parse({
    id: pet.id,
    customerId: pet.customerId,
    name: pet.name,
    species: pet.species,
    sex: pet.sex,
    birthday: pet.birthday,
    size: pet.size,
    actualWeight: pet.actualWeight,
    unitOfMeasureWeight: pet.unitOfMeasureWeight,
    sociabilityLevel: pet.sociabilityLevel,
    isNeutered: pet.isNeutered,
    vaccinationCard: await getFileUrl(pet.vaccinationCard),
    profilePicture: await getFileUrl(pet.profilePicture)
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreatePetDTO.parse(req.body);
        const newPet = await petService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Mascota creada exitosamente.",
            pet: await toResponseDTO(newPet)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdatePetDTO.parse(req.body);
        const updatedPet = await petService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Mascota actualizada exitosamente.",
            pet: await toResponseDTO(updatedPet)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedPet = await petService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Mascota eliminada exitosamente.",
            pet: await toResponseDTO(removedPet)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredPet = await petService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Mascota restaurada exitosamente.",
            pet: await toResponseDTO(restoredPet)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pet = await petService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Mascota encontrada exitosamente.",
            pet: await toResponseDTO(pet)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const pets = await petService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Mascotas obtenidas exitosamente.",
            pets: await Promise.all(pets.map(toResponseDTO))
        });
    } catch(error) {
        next(error);
    }
};

const getAllByCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const pets = await petService.getAllByCustomer(customerId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Mascotas del cliente obtenidas exitosamente.",
            pets: await Promise.all(pets.map(toResponseDTO))
        });
    } catch(error) {
        next(error);
    }
};

const updateProfilePicture = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await petService.updateProfilePicture(id, req.file);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Foto de perfil de la mascota actualizada exitosamente.",
            pet: await toResponseDTO(updated)
        });
    } catch(error) {
        next(error);
    }
};

const removeProfilePicture = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await petService.removeProfilePicture(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Foto de perfil de la mascota eliminada exitosamente.",
            pet: await toResponseDTO(updated)
        });
    } catch(error) {
        next(error);
    }
};

const updateVaccinationCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await petService.updateVaccinationCard(id, req.file);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Carne de vacunacion de la mascota actualizado exitosamente.",
            pet: await toResponseDTO(updated)
        });
    } catch(error) {
        next(error);
    }
};

const removeVaccinationCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await petService.removeVaccinationCard(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Carne de vacunacion de la mascota eliminado exitosamente.",
            pet: await toResponseDTO(updated)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, getAllByCustomer, updateProfilePicture, removeProfilePicture, updateVaccinationCard, removeVaccinationCard };
