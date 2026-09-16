const { Router } = require('express');
const roomBranchController = require('./roomBranch.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/', verifyToken, roomBranchController.create);
router.get('/', verifyToken, roomBranchController.getAll);
router.get('/branch/:branchId', verifyToken, roomBranchController.getAllByBranch);
router.get('/:id', verifyToken, roomBranchController.getById);
router.put('/:id', verifyToken, roomBranchController.update);
router.delete('/:id', verifyToken, roomBranchController.remove);
router.patch('/:id/restore', verifyToken, roomBranchController.restore);

module.exports = router;
