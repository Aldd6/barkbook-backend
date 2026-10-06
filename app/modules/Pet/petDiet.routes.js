const { Router } = require('express');
const petDietController = require('./petDiet.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, denyCustomers, byPet, byPetRecord } = require('../../shared/middlewares/ownership.js');
const { PetDiet } = require('../../shared/utils/index.js');

const router = Router();
const PET_DIET_ENTITY_NAME = 'Pet_Diet';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.body?.petId)), petDietController.create);
router.get('/', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), denyCustomers, petDietController.getAll);
router.get('/pet/:petId', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.petId)), petDietController.getAllByPet);
router.get('/:id', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetDiet, req => req.params.id)), petDietController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetDiet, req => req.params.id)), petDietController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetDiet, req => req.params.id)), petDietController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetDiet, req => req.params.id)), petDietController.restore);
router.patch('/:id/activate', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetDiet, req => req.params.id)), petDietController.activateDiet);
router.patch('/:id/deactivate', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_DIET_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetDiet, req => req.params.id)), petDietController.deactivateDiet);

module.exports = router;
