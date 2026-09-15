const { Router } = require('express');
const authController = require('./auth.controller.js');

const router = Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh', authController.refresh);

module.exports = router;
