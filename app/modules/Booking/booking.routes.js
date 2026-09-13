const { Router } = require('express');
const bookingController = require('./booking.controller.js');

const router = Router();

router.post('/', bookingController.create);
router.get('/', bookingController.getAll);
router.get('/pending', bookingController.getPendingWithTimeRemaining);
router.get('/auto-cancelled', bookingController.getAutoCancelledBookings);
router.get('/customer/:customerId', bookingController.getAllByCustomer);
router.get('/:id', bookingController.getById);
router.patch('/:id/confirm-payment', bookingController.confirmPayment);

module.exports = router;
