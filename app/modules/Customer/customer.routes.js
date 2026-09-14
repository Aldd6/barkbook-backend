const { Router } = require('express');
const customerController = require('./customer.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/', verifyToken, customerController.create);
router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.remove);
router.patch('/:id/restore', customerController.restore);

module.exports = router;
