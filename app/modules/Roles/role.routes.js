const { Router } = require('express');
const roleController = require('./role.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();
const onlyAdmin = [verifyToken, authorize('Gestionar roles y permisos')];

router.post('/', onlyAdmin, roleController.create);
router.get('/', onlyAdmin, roleController.getAll);
router.patch('/permissions', onlyAdmin, roleController.updatePermissions);
router.get('/:id', onlyAdmin, roleController.getById);
router.get('/:id/permissions', onlyAdmin, roleController.getAllPermissionsAssociatedToRole);
router.delete('/:id', onlyAdmin, roleController.remove);
router.patch('/:id/restore', onlyAdmin, roleController.restore);

module.exports = router;
