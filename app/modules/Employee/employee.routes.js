const { Router } = require('express');
const employeeController = require('./employee.controller.js');

const router = Router();

router.post('/', employeeController.create);
router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);
router.patch('/:id/restore', employeeController.restore);
router.patch('/:id/assign-user', employeeController.assignUser);

module.exports = router;
