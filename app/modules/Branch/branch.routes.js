const { Router } = require('express');
const branchController = require('./branch.controller.js');

const router = Router();

router.post('/', branchController.create);
router.get('/', branchController.getAll);
router.get('/:id', branchController.getById);
router.put('/:id', branchController.update);
router.delete('/:id', branchController.remove);
router.patch('/:id/restore', branchController.restore);

module.exports = router;
