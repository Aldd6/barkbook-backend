const { Router } = require('express');
const branchController = require('./branch.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Crear sedes'), branchController.create);
router.get('/', verifyToken, branchController.getAll);
router.get('/:id', verifyToken, branchController.getById);
router.put('/:id', verifyToken, branchController.update);
router.delete('/:id', verifyToken, branchController.remove);
router.patch('/:id/restore', verifyToken, branchController.restore);

module.exports = router;
