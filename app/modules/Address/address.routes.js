const { Router } = require('express');
const addressController = require('./address.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.get('/states', addressController.getAllStates);
router.get('/states/:stateId/cities', addressController.getCitiesByState);

module.exports = router;
