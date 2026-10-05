const { Router } = require('express');
const checkInController = require('./checkIn.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const CHECK_IN_ENTITY_NAME = 'Check_In';

router.post('/', verifyToken, authorize('Hacer check-in de reservas'), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.create);
router.get('/', verifyToken, authorize('Ver reservas del dia'), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.getAll);
router.get('/booking/:bookingId/available-rooms', verifyToken, authorize('Hacer check-in de reservas'), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.getAvailableRoomsForBooking);
router.get('/booking/:bookingId', verifyToken, authorize('Consultar cuenta de reservacion'), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.getByBooking);
router.get('/:id', verifyToken, authorize('Consultar cuenta de reservacion'), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.getById);

module.exports = router;
