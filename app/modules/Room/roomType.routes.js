const { Router } = require('express');
const roomTypeController = require('./roomType.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Crear tipos de habitacion'), roomTypeController.create);
router.get('/', verifyToken, roomTypeController.getAll);
router.get('/:id', verifyToken, roomTypeController.getById);
router.put('/:id', verifyToken, roomTypeController.update);
router.delete('/:id', verifyToken, roomTypeController.remove);
router.patch('/:id/restore', verifyToken, roomTypeController.restore);

module.exports = router;
