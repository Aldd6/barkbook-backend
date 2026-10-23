const { Router } = require('express');
const petVaccineController = require('./petVaccine.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, denyCustomers, byPet, byPetRecord } = require('../../shared/middlewares/ownership.js');
const { PetVaccine } = require('../../shared/utils/index.js');

const router = Router();
const PET_VACCINE_ENTITY_NAME = 'Pet_Vaccine';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_VACCINE_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.body?.petId)), petVaccineController.create);
router.get('/', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), denyCustomers, petVaccineController.getAll);
router.get('/pet/:petId', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.petId)), petVaccineController.getAllByPet);
router.get('/:id', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetVaccine, req => req.params.id)), petVaccineController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_VACCINE_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetVaccine, req => req.params.id)), petVaccineController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_VACCINE_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetVaccine, req => req.params.id)), petVaccineController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_VACCINE_ENTITY_NAME), ensureCustomerOwnership(byPetRecord(PetVaccine, req => req.params.id)), petVaccineController.restore);

module.exports = router;
