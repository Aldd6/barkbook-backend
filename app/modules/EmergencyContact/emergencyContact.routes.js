const { Router } = require('express');
const emergencyContactController = require('./emergencyContact.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, denyCustomers, byCustomer, byEmergencyContact } = require('../../shared/middlewares/ownership.js');

const router = Router();
const EMERGENCY_ENTITY_NAME = 'Emergency_Contact'

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA), registerWorklog(EMERGENCY_ENTITY_NAME), ensureCustomerOwnership(byCustomer(req => req.body?.customerId)), emergencyContactController.create);
router.get('/', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), denyCustomers, emergencyContactController.getAll);
router.get('/customer/:customerId', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), ensureCustomerOwnership(byCustomer(req => req.params.customerId)), emergencyContactController.getAllByCustomer);
router.get('/:id', verifyToken, registerWorklog(EMERGENCY_ENTITY_NAME), ensureCustomerOwnership(byEmergencyContact(req => req.params.id)), emergencyContactController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA), registerWorklog(EMERGENCY_ENTITY_NAME), ensureCustomerOwnership(byEmergencyContact(req => req.params.id)), emergencyContactController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA), registerWorklog(EMERGENCY_ENTITY_NAME), ensureCustomerOwnership(byEmergencyContact(req => req.params.id)), emergencyContactController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA), registerWorklog(EMERGENCY_ENTITY_NAME), ensureCustomerOwnership(byEmergencyContact(req => req.params.id)), emergencyContactController.restore);

module.exports = router;
