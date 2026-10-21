const { Router } = require('express');
const employeeController = require('./employee.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');
const { PERMISSIONS } = require('../../shared/constants/enums.js');
const { ensureSelfEmployee } = require('../../shared/middlewares/ownership.js');
const { uploadImage } = require('../../shared/middlewares/upload.file.js');

const router = Router();
const EMPLOYEE_ENTITY_NAME = 'Employee';

router.post('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.create);
router.get('/', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.getAll);
router.get('/:id', verifyToken, ensureSelfEmployee(req => req.params.id, PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.getById);
router.put('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.remove);
router.patch('/:id/restore', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.restore);
router.patch('/:id/assign-user', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.assignUser);

// multipart/form-data con el archivo en el campo "file"
router.put('/:id/profile-picture', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), uploadImage, employeeController.updateProfilePicture);
router.delete('/:id/profile-picture', verifyToken, authorize(PERMISSIONS.GESTIONAR_EMPLEADOS), registerWorklog(EMPLOYEE_ENTITY_NAME), employeeController.removeProfilePicture);

module.exports = router;
