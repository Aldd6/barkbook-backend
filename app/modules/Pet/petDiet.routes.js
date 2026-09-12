const { Router } = require('express');
const petDietController = require('./petDiet.controller.js');

const router = Router();

router.post('/', petDietController.create);
router.get('/', petDietController.getAll);
router.get('/pet/:petId', petDietController.getAllByPet);
router.get('/:id', petDietController.getById);
router.put('/:id', petDietController.update);
router.delete('/:id', petDietController.remove);
router.patch('/:id/restore', petDietController.restore);
router.patch('/:id/activate', petDietController.activateDiet);
router.patch('/:id/deactivate', petDietController.deactivateDiet);

module.exports = router;
