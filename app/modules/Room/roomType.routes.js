const { Router } = require('express');
const roomTypeController = require('./roomType.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const ROOM_TYPE_ENTITY_NAME = 'Room_Type';

router.post('/', verifyToken, authorize('Crear tipos de habitacion'), registerWorklog(ROOM_TYPE_ENTITY_NAME), roomTypeController.create);
router.get('/', verifyToken, registerWorklog(ROOM_TYPE_ENTITY_NAME), roomTypeController.getAll);
router.get('/:id', verifyToken, registerWorklog(ROOM_TYPE_ENTITY_NAME), roomTypeController.getById);
router.put('/:id', verifyToken, registerWorklog(ROOM_TYPE_ENTITY_NAME), roomTypeController.update);
router.delete('/:id', verifyToken, registerWorklog(ROOM_TYPE_ENTITY_NAME), roomTypeController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(ROOM_TYPE_ENTITY_NAME), roomTypeController.restore);

module.exports = router;
