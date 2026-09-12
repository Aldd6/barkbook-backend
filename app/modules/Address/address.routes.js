const { Router } = require('express');
const addressController = require('./address.controller.js');

const router = Router();

router.get('/states', addressController.getAllStates);
router.get('/states/:stateId/cities', addressController.getCitiesByState);

module.exports = router;
