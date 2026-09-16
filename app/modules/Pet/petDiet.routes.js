const { Router } = require('express');
const petDietController = require('./petDiet.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const PET_DIET_ENTITY_NAME = 'Pet_Diet';

router.post('/', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.create);
router.get('/', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.getAll);
router.get('/pet/:petId', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.getAllByPet);
router.get('/:id', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.getById);
router.put('/:id', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.update);
router.delete('/:id', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.restore);
router.patch('/:id/activate', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.activateDiet);
router.patch('/:id/deactivate', verifyToken, registerWorklog(PET_DIET_ENTITY_NAME), petDietController.deactivateDiet);

module.exports = router;
