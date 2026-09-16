const { Router } = require('express');
const userController = require('./user.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const USER_ENTITY_NAME = 'User';

router.post('/', verifyToken, authorize('Crear usuarios'), registerWorklog(USER_ENTITY_NAME), userController.create);
router.get('/', verifyToken, registerWorklog(USER_ENTITY_NAME), userController.getAllUsers);
router.get('/:uid', verifyToken, registerWorklog(USER_ENTITY_NAME), userController.getUserByUid);
router.put('/:uid', verifyToken, registerWorklog(USER_ENTITY_NAME), userController.update);
router.delete('/:uid', verifyToken, registerWorklog(USER_ENTITY_NAME), userController.remove);

module.exports = router;