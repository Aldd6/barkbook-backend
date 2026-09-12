const { Router } = require('express');
const petSanityController = require('./petSanity.controller.js');

const router = Router();

router.post('/', petSanityController.create);
router.get('/', petSanityController.getAll);
router.get('/pet/:petId', petSanityController.getAllByPet);
router.get('/:id', petSanityController.getById);
router.put('/:id', petSanityController.update);
router.delete('/:id', petSanityController.remove);
router.patch('/:id/restore', petSanityController.restore);

module.exports = router;
