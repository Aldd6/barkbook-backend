const { Router } = require('express');
const serviceOrderController = require('./serviceOrder.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, byBooking, byServiceOrder } = require('../../shared/middlewares/ownership.js');

const router = Router();
const SERVICE_ORDER_ENTITY_NAME = 'Service_Order';

router.post('/booking/:bookingId', verifyToken, authorize(PERMISSIONS.CARGAR_SERVICIOS_RESERVACION), registerWorklog(SERVICE_ORDER_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), serviceOrderController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.SUBIR_INFORMES_SERVICIOS), registerWorklog(SERVICE_ORDER_ENTITY_NAME), serviceOrderController.getAll);
router.get('/booking/:bookingId', verifyToken, authorize.authorizeAny(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION, PERMISSIONS.SUBIR_INFORMES_SERVICIOS), registerWorklog(SERVICE_ORDER_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), serviceOrderController.getByBooking);
router.patch('/:id/complete', verifyToken, authorize(PERMISSIONS.SUBIR_INFORMES_SERVICIOS), registerWorklog(SERVICE_ORDER_ENTITY_NAME), serviceOrderController.complete);
router.patch('/:id/cancel', verifyToken, authorize.authorizeAny(PERMISSIONS.CARGAR_SERVICIOS_RESERVACION, PERMISSIONS.SUBIR_INFORMES_SERVICIOS, PERMISSIONS.HACER_CHECK_OUT), registerWorklog(SERVICE_ORDER_ENTITY_NAME), ensureCustomerOwnership(byServiceOrder(req => req.params.id)), serviceOrderController.cancel);

module.exports = router;
