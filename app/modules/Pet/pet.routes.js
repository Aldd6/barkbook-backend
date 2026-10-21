const { Router } = require('express');
const petController = require('./pet.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, denyCustomers, byCustomer, byPet } = require('../../shared/middlewares/ownership.js');
const { uploadImage, uploadDocument } = require('../../shared/middlewares/upload.file.js');

const router = Router();
const PET_ENTITY_NAME = 'Pet'

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byCustomer(req => req.body?.customerId)), petController.create);
router.get('/', verifyToken, registerWorklog(PET_ENTITY_NAME), denyCustomers, petController.getAll);
router.get('/customer/:customerId', verifyToken, registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byCustomer(req => req.params.customerId)), petController.getAllByCustomer);
router.get('/:id', verifyToken, registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), petController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), petController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), petController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), petController.restore);

// multipart/form-data con el archivo en el campo "file"
router.put('/:id/profile-picture', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), uploadImage, petController.updateProfilePicture);
router.delete('/:id/profile-picture', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), petController.removeProfilePicture);
router.put('/:id/vaccination-card', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), uploadDocument, petController.updateVaccinationCard);
router.delete('/:id/vaccination-card', verifyToken, authorize(PERMISSIONS.GESTIONAR_MASCOTAS), registerWorklog(PET_ENTITY_NAME), ensureCustomerOwnership(byPet(req => req.params.id)), petController.removeVaccinationCard);

module.exports = router;
