const { Router } = require('express');
const roomBranchController = require('./roomBranch.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');

const router = Router();
const ROOM_BRANCH_ENTITY_NAME = 'Room_Branch';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_HABITACIONES_SEDE), registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.create);
router.get('/', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.getAll);
router.get('/branch/:branchId', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.getAllByBranch);
router.get('/:id', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_HABITACIONES_SEDE), registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_HABITACIONES_SEDE), registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_HABITACIONES_SEDE), registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.restore);

module.exports = router;
