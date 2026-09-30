const { Router } = require('express');
const bookingController = require('./booking.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const BOOKING_ENTITY_NAME = 'Booking';

router.post('/', verifyToken, authorize('Crear reservaciones'), registerWorklog(BOOKING_ENTITY_NAME),  bookingController.create);
router.get('/', verifyToken, authorize('Ver reservas del dia'), registerWorklog(BOOKING_ENTITY_NAME), bookingController.getAll);
router.get('/pending', verifyToken, authorize('Ver reservas del dia'), registerWorklog(BOOKING_ENTITY_NAME), bookingController.getPendingWithTimeRemaining);
router.get('/auto-cancelled', verifyToken, authorize('Ver reservas del dia'), registerWorklog(BOOKING_ENTITY_NAME),  bookingController.getAutoCancelledBookings);
router.get('/customer/:customerId', verifyToken, authorize('Consultar cuenta de reservacion'), registerWorklog(BOOKING_ENTITY_NAME), bookingController.getAllByCustomer);
router.get('/:id', verifyToken, authorize('Consultar cuenta de reservacion'), registerWorklog(BOOKING_ENTITY_NAME), bookingController.getById);
router.patch('/:id/confirm-payment', verifyToken, authorize('Aplicar pagos cobrados en mostrador'), registerWorklog(BOOKING_ENTITY_NAME), bookingController.confirmPayment);

module.exports = router;
