const { Router } = require('express');
const serviceController = require('./service.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, byBooking } = require('../../shared/middlewares/ownership.js');

const router = Router();
const SERVICE_ENTITY_NAME = 'Service';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS), registerWorklog(SERVICE_ENTITY_NAME), serviceController.create);
router.post('/booking/:bookingId/charge', verifyToken, authorize(PERMISSIONS.CARGAR_SERVICIOS_RESERVACION), registerWorklog(SERVICE_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), serviceController.chargeToBooking);
router.get('/', verifyToken, registerWorklog(SERVICE_ENTITY_NAME), serviceController.getAll);
router.get('/:id', verifyToken, registerWorklog(SERVICE_ENTITY_NAME), serviceController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS), registerWorklog(SERVICE_ENTITY_NAME), serviceController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS), registerWorklog(SERVICE_ENTITY_NAME), serviceController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS), registerWorklog(SERVICE_ENTITY_NAME), serviceController.restore);

module.exports = router;
