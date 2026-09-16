const { Router } = require('express');
const petVaccineController = require('./petVaccine.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const PET_VACCINE_ENTITY_NAME = 'Pet_Vaccine';

router.post('/', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.create);
router.get('/', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.getAll);
router.get('/pet/:petId', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.getAllByPet);
router.get('/:id', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.getById);
router.put('/:id', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.update);
router.delete('/:id', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(PET_VACCINE_ENTITY_NAME), petVaccineController.restore);

module.exports = router;
