const express = require('express');
const router = express.Router();
const proteger = require('../middleware/authMiddleware');
const { getPersonajes, createPersonaje, updatePersonaje, deletePersonaje } = require('../controllers/personajeController');

router.use(proteger); // Proteger todas las rutas
router.get('/', getPersonajes);
router.post('/', createPersonaje);
router.put('/:id', updatePersonaje);
router.delete('/:id', deletePersonaje);

module.exports = router;