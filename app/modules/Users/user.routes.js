const { Router } = require('express');
const userController = require('./user.controller.js');

const router = Router();

router.post('/', userController.create);
router.get('/', userController.getAllUsers);
router.get('/:uid', userController.getUserByUid);
router.put('/:uid', userController.update);
router.delete('/:uid', userController.remove);

module.exports = router;