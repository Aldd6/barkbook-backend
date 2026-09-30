const { Router } = require('express');
const emergencyContactController = require('./emergencyContact.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const EMERGENCY_ENTITY_NAME = 'Emergency_Contact'

router.post('/', verifyToken, authorize('Gestionar contactos de emergencia'), registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.create);
router.get('/', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.getAll);
router.get('/customer/:customerId', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.getAllByCustomer);
router.get('/:id', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.getById);
router.put('/:id', verifyToken, authorize('Gestionar contactos de emergencia'), registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.update);
router.delete('/:id', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), emergencyContactController.restore);

module.exports = router;
