const { Router } = require('express');
const customerController = require('./customer.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/', verifyToken, customerController.create);
router.get('/', verifyToken, customerController.getAll);
router.get('/:id', verifyToken, customerController.getById);
router.put('/:id', verifyToken, customerController.update);
router.delete('/:id', verifyToken, customerController.remove);
router.patch('/:id/restore', verifyToken, customerController.restore);

module.exports = router;
