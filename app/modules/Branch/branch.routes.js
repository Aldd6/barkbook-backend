const { Router } = require('express');
const branchController = require('./branch.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const BRANCH_ENTITY_NAME = 'Branch'

router.post('/', verifyToken, authorize('Crear sedes'), registerWorklog(BRANCH_ENTITY_NAME), branchController.create);
router.get('/', verifyToken, registerWorklog(BRANCH_ENTITY_NAME), branchController.getAll);
router.get('/:id', verifyToken, registerWorklog(BRANCH_ENTITY_NAME), branchController.getById);
router.put('/:id', verifyToken, registerWorklog(BRANCH_ENTITY_NAME), branchController.update);
router.delete('/:id', verifyToken, registerWorklog(BRANCH_ENTITY_NAME), branchController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(BRANCH_ENTITY_NAME), branchController.restore);

module.exports = router;
