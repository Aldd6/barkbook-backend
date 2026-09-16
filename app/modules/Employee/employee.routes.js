const { Router } = require('express');
const employeeController = require('./employee.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Crear perfiles de empleados'), employeeController.create);
router.get('/', verifyToken, employeeController.getAll);
router.get('/:id', verifyToken, employeeController.getById);
router.put('/:id', verifyToken, employeeController.update);
router.delete('/:id', verifyToken, employeeController.remove);
router.patch('/:id/restore', verifyToken, employeeController.restore);
router.patch('/:id/assign-user', verifyToken, authorize('Crear perfiles de empleados'), employeeController.assignUser);

module.exports = router;
