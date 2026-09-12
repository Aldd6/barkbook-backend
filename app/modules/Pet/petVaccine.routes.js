const { Router } = require('express');
const petVaccineController = require('./petVaccine.controller.js');

const router = Router();

router.post('/', petVaccineController.create);
router.get('/', petVaccineController.getAll);
router.get('/pet/:petId', petVaccineController.getAllByPet);
router.get('/:id', petVaccineController.getById);
router.put('/:id', petVaccineController.update);
router.delete('/:id', petVaccineController.remove);
router.patch('/:id/restore', petVaccineController.restore);

module.exports = router;
