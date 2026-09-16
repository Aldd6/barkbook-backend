const { Router } = require('express');
const petVaccineController = require('./petVaccine.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/', verifyToken, petVaccineController.create);
router.get('/', verifyToken, petVaccineController.getAll);
router.get('/pet/:petId', verifyToken, petVaccineController.getAllByPet);
router.get('/:id', verifyToken, petVaccineController.getById);
router.put('/:id', verifyToken, petVaccineController.update);
router.delete('/:id', verifyToken, petVaccineController.remove);
router.patch('/:id/restore', verifyToken, petVaccineController.restore);

module.exports = router;
