const { Router } = require('express');
const petDietController = require('./petDiet.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');

const router = Router();

router.post('/', verifyToken, petDietController.create);
router.get('/', verifyToken, petDietController.getAll);
router.get('/pet/:petId', verifyToken, petDietController.getAllByPet);
router.get('/:id', verifyToken, petDietController.getById);
router.put('/:id', verifyToken, petDietController.update);
router.delete('/:id', verifyToken, petDietController.remove);
router.patch('/:id/restore', verifyToken, petDietController.restore);
router.patch('/:id/activate', verifyToken, petDietController.activateDiet);
router.patch('/:id/deactivate', verifyToken, petDietController.deactivateDiet);

module.exports = router;
