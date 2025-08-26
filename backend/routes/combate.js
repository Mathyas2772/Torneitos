const express = require('express');
const router = express.Router();
const proteger = require('../middleware/authMiddleware');
const { simularCombate } = require('../controllers/combateController');

router.post('/', proteger, simularCombate);

module.exports = router;