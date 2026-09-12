const { Router } = require('express');
const roomInventoryController = require('./roomInventory.controller.js');

const router = Router();

router.post('/generate', roomInventoryController.generateBulk);
router.get('/', roomInventoryController.getAll);
router.get('/room-branch/:roomBranchId', roomInventoryController.getAllByRoomBranch);
router.get('/:id', roomInventoryController.getById);
router.put('/:id', roomInventoryController.update);
router.delete('/:id', roomInventoryController.remove);
router.patch('/:id/restore', roomInventoryController.restore);

module.exports = router;
