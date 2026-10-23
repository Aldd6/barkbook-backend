const { Router } = require('express');
const checkInController = require('./checkIn.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, byBooking, byCheckIn } = require('../../shared/middlewares/ownership.js');

const router = Router();
const CHECK_IN_ENTITY_NAME = 'Check_In';

router.post('/', verifyToken, authorize(PERMISSIONS.HACER_CHECK_IN), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.VER_RESERVAS_DIA), registerWorklog(CHECK_IN_ENTITY_NAME), checkInController.getAll);
router.get('/booking/:bookingId/available-rooms', verifyToken, authorize(PERMISSIONS.HACER_CHECK_IN), registerWorklog(CHECK_IN_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), checkInController.getAvailableRoomsForBooking);
router.get('/booking/:bookingId/pets', verifyToken, authorize(PERMISSIONS.HACER_CHECK_IN), registerWorklog(CHECK_IN_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), checkInController.getPetsForBooking);
router.get('/booking/:bookingId', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(CHECK_IN_ENTITY_NAME), ensureCustomerOwnership(byBooking(req => req.params.bookingId)), checkInController.getByBooking);
router.get('/:id', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(CHECK_IN_ENTITY_NAME), ensureCustomerOwnership(byCheckIn(req => req.params.id)), checkInController.getById);

module.exports = router;
