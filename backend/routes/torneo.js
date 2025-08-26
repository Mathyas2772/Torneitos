const express = require('express');
const router = express.Router();
const { getTorneos, getTorneoById, createTorneo, simularCombate, deleteTorneo } = require('../controllers/torneoController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para obtener todos los torneos del usuario
router.get('/', authMiddleware, getTorneos);

// Ruta para obtener un torneo específico por ID
router.get('/:id', authMiddleware, getTorneoById);

// Ruta para crear un nuevo torneo
router.post('/', authMiddleware, createTorneo);

// Ruta para simular un combate individual en un torneo
router.post('/:id/simular', authMiddleware, simularCombate);

// Ruta para eliminar un torneo
router.delete('/:id', authMiddleware, deleteTorneo);

module.exports = router;