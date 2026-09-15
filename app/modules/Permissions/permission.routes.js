const { Router } = require('express');
const permissionController = require('./permission.controller.js');

const router = Router();

router.post('/', permissionController.create);
router.get('/', permissionController.getAll);
router.delete('/:permissionId', permissionController.remove);
router.patch('/:permissionId/restore', permissionController.restore);

module.exports = router;
