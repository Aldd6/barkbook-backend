const { Router } = require('express');
const bookingController = require('./booking.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, byCustomer, byBooking } = require('../../shared/middlewares/ownership.js');

const router = Router();
const BOOKING_ENTITY_NAME = 'Booking';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_RESERVACIONES), registerWorklog(BOOKING_ENTITY_NAME),  ensureCustomerOwnership(byCustomer(req => req.body?.customerId)), bookingController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.VER_RESERVAS_DIA), registerWorklog(BOOKING_ENTITY_NAME), bookingController.getAll);
router.get('/pending', verifyToken, authorize(PERMISSIONS.VER_RESERVAS_DIA), registerWorklog(BOOKING_ENTITY_NAME), bookingController.getPendingWithTimeRemaining);
router.get('/auto-cancelled', verifyToken, authorize(PERMISSIONS.VER_RESERVAS_DIA), registerWorklog(BOOKING_ENTITY_NAME),  bookingController.getAutoCancelledBookings);
router.get('/customer/:customerId', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(BOOKING_ENTITY_NAME), ensureCustomerOwnership(byCustomer(req => req.params.customerId)), bookingController.getAllByCustomer);
router.get('/:id', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(BOOKING_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.id)), bookingController.getById);
router.patch('/:id/confirm-payment', verifyToken, authorize(PERMISSIONS.APLICAR_PAGOS_MOSTRADOR), registerWorklog(BOOKING_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.id)), bookingController.confirmPayment);

module.exports = router;
