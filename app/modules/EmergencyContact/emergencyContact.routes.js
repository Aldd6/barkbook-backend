const { Router } = require('express');
const emergencyContactController = require('./emergencyContact.controller.js');

const router = Router();

router.post('/', emergencyContactController.create);
router.get('/', emergencyContactController.getAll);
router.get('/customer/:customerId', emergencyContactController.getAllByCustomer);
router.get('/:id', emergencyContactController.getById);
router.put('/:id', emergencyContactController.update);
router.delete('/:id', emergencyContactController.remove);
router.patch('/:id/restore', emergencyContactController.restore);

module.exports = router;
