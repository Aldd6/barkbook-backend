const { Router } = require('express');
const bookingCancellationController = require('./bookingCancellation.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, byBooking } = require('../../shared/middlewares/ownership.js');

const router = Router();
const BOOKING_CANCELLATION_ENTITY_NAME = 'Booking_Cancellation';

router.post('/', verifyToken, authorize(PERMISSIONS.SOLICITAR_CANCELACION_RESERVACION), registerWorklog(BOOKING_CANCELLATION_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.body?.bookingId)), bookingCancellationController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION), registerWorklog(BOOKING_CANCELLATION_ENTITY_NAME), bookingCancellationController.getAll);
router.get('/booking/:bookingId', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(BOOKING_CANCELLATION_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), bookingCancellationController.getByBooking);
router.patch('/:id/approve', verifyToken, authorize(PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION), registerWorklog(BOOKING_CANCELLATION_ENTITY_NAME), bookingCancellationController.approve);
router.patch('/:id/reject', verifyToken, authorize(PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION), registerWorklog(BOOKING_CANCELLATION_ENTITY_NAME), bookingCancellationController.reject);

module.exports = router;
