const { Router } = require('express');
const checkOutController = require('./checkOut.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const CHECK_OUT_ENTITY_NAME = 'Check_Out';

router.post('/', verifyToken, authorize('Hacer check-out de reservas'), registerWorklog(CHECK_OUT_ENTITY_NAME), checkOutController.create);
router.get('/', verifyToken, authorize('Ver reservas del dia'), registerWorklog(CHECK_OUT_ENTITY_NAME), checkOutController.getAll);
router.get('/check-in/:checkInId', verifyToken, authorize('Consultar cuenta de reservacion'), registerWorklog(CHECK_OUT_ENTITY_NAME), checkOutController.getByCheckIn);
router.get('/:id', verifyToken, authorize('Consultar cuenta de reservacion'), registerWorklog(CHECK_OUT_ENTITY_NAME), checkOutController.getById);

module.exports = router;
