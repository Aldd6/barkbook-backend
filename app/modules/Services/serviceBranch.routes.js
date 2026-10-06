const { Router } = require('express');
const serviceBranchController = require('./serviceBranch.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const SERVICE_BRANCH_ENTITY_NAME = 'Service_Branch';

router.post('/', verifyToken, authorize('Gestionar catalogo de servicios'), registerWorklog(SERVICE_BRANCH_ENTITY_NAME), serviceBranchController.create);
router.get('/', verifyToken, registerWorklog(SERVICE_BRANCH_ENTITY_NAME), serviceBranchController.getAll);
router.get('/branch/:branchId', verifyToken, registerWorklog(SERVICE_BRANCH_ENTITY_NAME), serviceBranchController.getAllByBranch);
router.get('/:id', verifyToken, registerWorklog(SERVICE_BRANCH_ENTITY_NAME), serviceBranchController.getById);
router.delete('/:id', verifyToken, authorize('Gestionar catalogo de servicios'), registerWorklog(SERVICE_BRANCH_ENTITY_NAME), serviceBranchController.remove);
router.patch('/:id/restore', verifyToken, authorize('Gestionar catalogo de servicios'), registerWorklog(SERVICE_BRANCH_ENTITY_NAME), serviceBranchController.restore);

module.exports = router;
