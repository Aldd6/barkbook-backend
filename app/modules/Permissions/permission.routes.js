const { Router } = require('express');
const permissionController = require('./permission.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();
const onlyAdmin = [verifyToken, authorize('Gestionar roles y permisos')];

router.post('/', onlyAdmin, permissionController.create);
router.get('/', onlyAdmin, permissionController.getAll);
router.delete('/:permissionId', onlyAdmin, permissionController.remove);
router.patch('/:permissionId/restore', onlyAdmin, permissionController.restore);

module.exports = router;
