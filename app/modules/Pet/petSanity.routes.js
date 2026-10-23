const { Router } = require('express');
const petSanityController = require('./petSanity.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, denyCustomers, byPet, byPetRecord } = require('../../shared/middlewares/ownership.js');
const { PetSanity } = require('../../shared/utils/index.js');

const router = Router();
const PET_SANITY_ENTITY_NAME = 'Pet_Sanity';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_SANITY_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.body?.petId)), petSanityController.create);
router.get('/', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), denyCustomers, petSanityController.getAll);
router.get('/pet/:petId', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.petId)), petSanityController.getAllByPet);
router.get('/:id', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetSanity, req => req.params.id)), petSanityController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_SANITY_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetSanity, req => req.params.id)), petSanityController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_SANITY_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetSanity, req => req.params.id)), petSanityController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_SANITY_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetSanity, req => req.params.id)), petSanityController.restore);

module.exports = router;
