const { Router } = require('express');
const roomTypeController = require('./roomType.controller.js');

const router = Router();

router.post('/', roomTypeController.create);
router.get('/', roomTypeController.getAll);
router.get('/:id', roomTypeController.getById);
router.put('/:id', roomTypeController.update);
router.delete('/:id', roomTypeController.remove);
router.patch('/:id/restore', roomTypeController.restore);

module.exports = router;
