const { Router } = require('express');
const userController = require('./user.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureSelfUser } = require('../../shared/middlewares/ownership.js');

const router = Router();
const USER_ENTITY_NAME = 'User';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_USUARIOS), registerWorklog(USER_ENTITY_NAME), userController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_USUARIOS), registerWorklog(USER_ENTITY_NAME), userController.getAllUsers);
router.get('/customers', verifyToken, authorize(PERMISSIONS.GESTIONAR_USUARIOS), registerWorklog(USER_ENTITY_NAME), userController.getAllCustomers);
router.get('/customers/:uid', verifyToken, authorize(PERMISSIONS.GESTIONAR_USUARIOS), registerWorklog(USER_ENTITY_NAME), userController.getCustomerByUid);
router.get('/:uid', verifyToken, registerWorklog(USER_ENTITY_NAME), ensureSelfUser(req => req.params.uid, PERMISSIONS.GESTIONAR_USUARIOS), userController.getUserByUid);
router.put('/:uid', verifyToken, registerWorklog(USER_ENTITY_NAME), ensureSelfUser(req => req.params.uid, PERMISSIONS.GESTIONAR_USUARIOS), authorize.authorizeFields(['rolId', 'profileCompleted'], PERMISSIONS.GESTIONAR_USUARIOS), userController.update);
router.delete('/:uid', verifyToken, registerWorklog(USER_ENTITY_NAME), ensureSelfUser(req => req.params.uid, PERMISSIONS.GESTIONAR_USUARIOS), userController.remove);

module.exports = router;