const { Router } = require('express');
const authController = require('./auth.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh', authController.refresh);
router.post('/signout', authController.signout);
router.get('/me', verifyToken, authController.me);

module.exports = router;
