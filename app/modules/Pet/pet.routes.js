const { Router } = require('express');
const petController = require('./pet.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const authorize = require('../../shared/middlewares/authorize.js');

const router = Router();

router.post('/', verifyToken, authorize('Crear mascotas'), petController.create);
router.get('/', verifyToken, petController.getAll);
router.get('/customer/:customerId', verifyToken, petController.getAllByCustomer);
router.get('/:id', verifyToken, petController.getById);
router.put('/:id', verifyToken, petController.update);
router.delete('/:id', verifyToken, petController.remove);
router.patch('/:id/restore', verifyToken, petController.restore);

module.exports = router;
