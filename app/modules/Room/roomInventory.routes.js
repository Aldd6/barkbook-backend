const { Router } = require('express');
const roomInventoryController = require('./roomInventory.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const ROOM_INVENTORY_ENTITY_NAME = 'Room_Inventory';

router.post('/generate', verifyToken, authorize('Crear habitaciones fisicas'), registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.generateBulk);
router.get('/', verifyToken, registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.getAll);
router.get('/room-branch/:roomBranchId', verifyToken, registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.getAllByRoomBranch);
router.get('/:id', verifyToken, registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.getById);
router.put('/:id', verifyToken, registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.update);
router.delete('/:id', verifyToken, registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(ROOM_INVENTORY_ENTITY_NAME), roomInventoryController.restore);

module.exports = router;
