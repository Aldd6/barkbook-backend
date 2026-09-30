const { Router } = require('express');
const petController = require('./pet.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const PET_ENTITY_NAME = 'Pet'

router.post('/', verifyToken, authorize('Crear mascotas'), registerWorklog(PET_ENTITY_NAME), petController.create);
router.get('/', verifyToken, registerWorklog(PET_ENTITY_NAME), petController.getAll);
router.get('/customer/:customerId', verifyToken, registerWorklog(PET_ENTITY_NAME), petController.getAllByCustomer);
router.get('/:id', verifyToken, registerWorklog(PET_ENTITY_NAME), petController.getById);
router.put('/:id', verifyToken, registerWorklog(PET_ENTITY_NAME), petController.update);
router.delete('/:id', verifyToken, registerWorklog(PET_ENTITY_NAME), petController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(PET_ENTITY_NAME), petController.restore);

module.exports = router;
