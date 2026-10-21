const { Router } = require('express');
const checkOutController = require('./checkOut.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureCustomerOwnership, byCheckIn, byCheckOut } = require('../../shared/middlewares/ownership.js');

const router = Router();
const CHECK_OUT_ENTITY_NAME = 'Check_Out';

router.post('/', verifyToken, authorize(PERMISSIONS.HACER_CHECK_OUT), authorize.authorizeFields(['payment'], PERMISSIONS.APLICAR_PAGOS_MOSTRADOR), registerWorklog(CHECK_OUT_ENTITY_NAME), checkOutController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.VER_RESERVAS_DIA), registerWorklog(CHECK_OUT_ENTITY_NAME), checkOutController.getAll);
router.get('/check-in/:checkInId', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(CHECK_OUT_ENTITY_NAME), ensureCustomerOwnership(byCheckIn(req => req.params.checkInId)), checkOutController.getByCheckIn);
router.get('/:id', verifyToken, authorize(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION), registerWorklog(CHECK_OUT_ENTITY_NAME), ensureCustomerOwnership(byCheckOut(req => req.params.id)), checkOutController.getById);

module.exports = router;
