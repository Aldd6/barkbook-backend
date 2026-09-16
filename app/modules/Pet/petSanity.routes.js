const { Router } = require('express');
const petSanityController = require('./petSanity.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/', verifyToken, petSanityController.create);
router.get('/', verifyToken, petSanityController.getAll);
router.get('/pet/:petId', verifyToken, petSanityController.getAllByPet);
router.get('/:id', verifyToken, petSanityController.getById);
router.put('/:id', verifyToken, petSanityController.update);
router.delete('/:id', verifyToken, petSanityController.remove);
router.patch('/:id/restore', verifyToken, petSanityController.restore);

module.exports = router;
