const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const conectarDB = require('./config/db');
const personajeRoutes = require('./routes/personaje');
const authRoutes = require('./routes/auth');
const combateRoutes = require('./routes/combate');
const torneoRoutes = require('./routes/torneo');

// Configurar dotenv

dotenv.config();
const app = express();

// Conectar a MongoDB
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/personajes', personajeRoutes);
app.use('/auth', authRoutes);
app.use('/combates', combateRoutes);
app.use('/torneos', torneoRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));