const { Router } = require('express');
const roomBranchController = require('./roomBranch.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const ROOM_BRANCH_ENTITY_NAME = 'Room_Branch';

router.post('/', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.create);
router.get('/', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.getAll);
router.get('/branch/:branchId', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.getAllByBranch);
router.get('/:id', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.getById);
router.put('/:id', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.update);
router.delete('/:id', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(ROOM_BRANCH_ENTITY_NAME), roomBranchController.restore);

module.exports = router;
