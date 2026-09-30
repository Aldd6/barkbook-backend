const { Router } = require('express');
const customerController = require('./customer.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js')

const router = Router();
const CUSTOMER_ENTITY_NAME = 'Customer'

router.post('/', verifyToken, registerWorklog(CUSTOMER_ENTITY_NAME), customerController.create);
router.get('/', verifyToken, registerWorklog(CUSTOMER_ENTITY_NAME), customerController.getAll);
router.get('/:id', verifyToken, registerWorklog(CUSTOMER_ENTITY_NAME), customerController.getById);
router.put('/:id', verifyToken, registerWorklog(CUSTOMER_ENTITY_NAME), customerController.update);
router.delete('/:id', verifyToken, registerWorklog(CUSTOMER_ENTITY_NAME), customerController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(CUSTOMER_ENTITY_NAME), customerController.restore);

module.exports = router;
