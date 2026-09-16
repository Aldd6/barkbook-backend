const { Router } = require('express');
const roomInventoryController = require('./roomInventory.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/generate', verifyToken, authorize('Crear habitaciones fisicas'), roomInventoryController.generateBulk);
router.get('/', verifyToken, roomInventoryController.getAll);
router.get('/room-branch/:roomBranchId', verifyToken, roomInventoryController.getAllByRoomBranch);
router.get('/:id', verifyToken, roomInventoryController.getById);
router.put('/:id', verifyToken, roomInventoryController.update);
router.delete('/:id', verifyToken, roomInventoryController.remove);
router.patch('/:id/restore', verifyToken, roomInventoryController.restore);

module.exports = router;
