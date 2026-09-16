const { Router } = require('express');
const bookingController = require('./booking.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Crear reservaciones'), bookingController.create);
router.get('/', verifyToken, authorize('Ver reservas del dia'), bookingController.getAll);
router.get('/pending', verifyToken, authorize('Ver reservas del dia'), bookingController.getPendingWithTimeRemaining);
router.get('/auto-cancelled', verifyToken, authorize('Ver reservas del dia'), bookingController.getAutoCancelledBookings);
router.get('/customer/:customerId', verifyToken, authorize('Consultar cuenta de reservacion'), bookingController.getAllByCustomer);
router.get('/:id', verifyToken, authorize('Consultar cuenta de reservacion'), bookingController.getById);
router.patch('/:id/confirm-payment', verifyToken, authorize('Aplicar pagos cobrados en mostrador'), bookingController.confirmPayment);

module.exports = router;
