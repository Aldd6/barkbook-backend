const { Router } = require('express');
const emergencyContactController = require('./emergencyContact.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Gestionar contactos de emergencia'), emergencyContactController.create);
router.get('/', verifyToken, emergencyContactController.getAll);
router.get('/customer/:customerId', verifyToken, emergencyContactController.getAllByCustomer);
router.get('/:id', verifyToken, emergencyContactController.getById);
router.put('/:id', verifyToken, authorize('Gestionar contactos de emergencia'), emergencyContactController.update);
router.delete('/:id', verifyToken, emergencyContactController.remove);
router.patch('/:id/restore', verifyToken, emergencyContactController.restore);

module.exports = router;
