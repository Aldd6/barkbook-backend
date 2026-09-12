const { Router } = require('express');
const petController = require('./pet.controller.js');

const router = Router();

router.post('/', petController.create);
router.get('/', petController.getAll);
router.get('/customer/:customerId', petController.getAllByCustomer);
router.get('/:id', petController.getById);
router.put('/:id', petController.update);
router.delete('/:id', petController.remove);
router.patch('/:id/restore', petController.restore);

module.exports = router;
