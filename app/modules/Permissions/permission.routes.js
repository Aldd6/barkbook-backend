const { Router } = require('express');
const permissionController = require('./permission.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const PERMISSION_ENTITY_NAME = 'Permission'
const onlyAdmin = [verifyToken, authorize('Gestionar roles y permisos'), registerWorklog(PERMISSION_ENTITY_NAME)];

router.post('/', onlyAdmin, permissionController.create);
router.get('/', onlyAdmin, permissionController.getAll);
router.delete('/:permissionId', onlyAdmin, permissionController.remove);
router.patch('/:permissionId/restore', onlyAdmin, permissionController.restore);

module.exports = router;
