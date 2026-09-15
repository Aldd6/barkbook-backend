const { Router } = require('express');
const roleController = require('./role.controller.js');

const router = Router();

router.post('/', roleController.create);
router.get('/', roleController.getAll);
router.patch('/permissions', roleController.updatePermissions);
router.get('/:id', roleController.getById);
router.get('/:id/permissions', roleController.getAllPermissionsAssociatedToRole);
router.delete('/:id', roleController.remove);
router.patch('/:id/restore', roleController.restore);

module.exports = router;
