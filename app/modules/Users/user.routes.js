const { Router } = require('express');
const userController = require('./user.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Crear usuarios'), userController.create);
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:uid', verifyToken, userController.getUserByUid);
router.put('/:uid', verifyToken, userController.update);
router.delete('/:uid', verifyToken, userController.remove);

module.exports = router;