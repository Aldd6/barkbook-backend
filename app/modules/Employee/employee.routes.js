const { Router } = require('express');
const employeeController = require('./employee.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const EMPLOYEE_ENTITY_NAME = 'Employee';

router.post('/', verifyToken, authorize('Crear perfiles de empleados'), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.create);
router.get('/', verifyToken, registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.getAll);
router.get('/:id', verifyToken, registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.getById);
router.put('/:id', verifyToken, registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.update);
router.delete('/:id', verifyToken, registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.restore);
router.patch('/:id/assign-user', verifyToken, authorize('Crear perfiles de empleados'), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.assignUser);

module.exports = router;
