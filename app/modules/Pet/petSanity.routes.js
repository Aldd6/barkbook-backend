const { Router } = require('express');
const petSanityController = require('./petSanity.controller.js');
const verifyToken = require('../../shared/middlewares/auth.jwt.js');
const registerWorklog = require('../../shared/middlewares/worklog.register.js');

const router = Router();
const PET_SANITY_ENTITY_NAME = 'Pet_Sanity';

router.post('/', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.create);
router.get('/', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.getAll);
router.get('/pet/:petId', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.getAllByPet);
router.get('/:id', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.getById);
router.put('/:id', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.update);
router.delete('/:id', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.remove);
router.patch('/:id/restore', verifyToken, registerWorklog(PET_SANITY_ENTITY_NAME), petSanityController.restore);

module.exports = router;
