const petVaccineService = require('./petVaccine.service.js');
const CreatePetVaccineDTO = require('./DTOs/create-pet-vaccine.js');
const UpdatePetVaccineDTO = require('./DTOs/update-pet-vaccine.js');
const PetVaccineResponseDTO = require('./DTOs/pet-vaccine-response.js');

const toResponseDTO = (vaccine) => PetVaccineResponseDTO.parse({
    id: vaccine.id,
    petId: vaccine.petId,
    vaccineName: vaccine.vaccineName,
    vaccineUse: vaccine.vaccineUse,
    dateOfPlacement: vaccine.dateOfPlacement
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreatePetVaccineDTO.parse(req.body);
        const newVaccine = await petVaccineService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Vacuna registrada exitosamente.",
            petVaccine: toResponseDTO(newVaccine)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdatePetVaccineDTO.parse(req.body);
        const updatedVaccine = await petVaccineService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Vacuna actualizada exitosamente.",
            petVaccine: toResponseDTO(updatedVaccine)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedVaccine = await petVaccineService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Vacuna eliminada exitosamente.",
            petVaccine: toResponseDTO(removedVaccine)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredVaccine = await petVaccineService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Vacuna restaurada exitosamente.",
            petVaccine: toResponseDTO(restoredVaccine)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vaccine = await petVaccineService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Vacuna encontrada exitosamente.",
            petVaccine: toResponseDTO(vaccine)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const vaccines = await petVaccineService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Vacunas obtenidas exitosamente.",
            petVaccines: vaccines.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByPet = async (req, res, next) => {
    try {
        const { petId } = req.params;
        const vaccines = await petVaccineService.getAllByPet(petId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Vacunas de la mascota obtenidas exitosamente.",
            petVaccines: vaccines.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, getAllByPet };
