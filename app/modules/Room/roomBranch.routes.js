const { Router } = require('express');
const roomBranchController = require('./roomBranch.controller.js');

const router = Router();

router.post('/', roomBranchController.create);
router.get('/', roomBranchController.getAll);
router.get('/branch/:branchId', roomBranchController.getAllByBranch);
router.get('/:id', roomBranchController.getById);
router.put('/:id', roomBranchController.update);
router.delete('/:id', roomBranchController.remove);
router.patch('/:id/restore', roomBranchController.restore);

module.exports = router;
