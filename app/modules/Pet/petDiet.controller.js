const petDietService = require('./petDiet.service.js');
const CreatePetDietDTO = require('./DTOs/create-pet-diet.js');
const UpdatePetDietDTO = require('./DTOs/update-pet-diet.js');
const PetDietResponseDTO = require('./DTOs/pet-diet-response.js');

const toResponseDTO = (diet) => PetDietResponseDTO.parse({
    id: diet.id,
    petId: diet.petId,
    dietType: diet.dietType,
    timesToEatAday: diet.timesToEatAday,
    servings: diet.servings,
    unitOfMeasureServing: diet.unitOfMeasureServing,
    observations: diet.observations,
    activeDiet: diet.activeDiet
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreatePetDietDTO.parse(req.body);
        const newDiet = await petDietService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Dieta creada exitosamente.",
            petDiet: toResponseDTO(newDiet)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdatePetDietDTO.parse(req.body);
        const updatedDiet = await petDietService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dieta actualizada exitosamente.",
            petDiet: toResponseDTO(updatedDiet)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedDiet = await petDietService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dieta eliminada exitosamente.",
            petDiet: toResponseDTO(removedDiet)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredDiet = await petDietService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dieta restaurada exitosamente.",
            petDiet: toResponseDTO(restoredDiet)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const diet = await petDietService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dieta encontrada exitosamente.",
            petDiet: toResponseDTO(diet)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const diets = await petDietService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dietas obtenidas exitosamente.",
            petDiets: diets.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByPet = async (req, res, next) => {
    try {
        const { petId } = req.params;
        const diets = await petDietService.getAllByPet(petId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dietas de la mascota obtenidas exitosamente.",
            petDiets: diets.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const activateDiet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const diet = await petDietService.activateDiet(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dieta activada exitosamente.",
            petDiet: toResponseDTO(diet)
        });
    } catch(error) {
        next(error);
    }
};

const deactivateDiet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const diet = await petDietService.deactivateDiet(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Dieta desactivada exitosamente.",
            petDiet: toResponseDTO(diet)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, getAllByPet, activateDiet, deactivateDiet };
