const mongoose = require('mongoose');

const personajeSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  origen: { type: String, required: true }, // Ej: "Dragon Ball", "Rocky", "Personaje Original"
  tipo: { type: String, enum: ['anime', 'pelicula', 'comic', 'videojuego', 'original'], required: true },
  habilidades: [String], // Ej: ["Rasengan", "Kamehameha"]
  fuerza: { type: Number, required: true, min: 1, max: 100 },
  descripcion: { type: String, default: '' }, // Campo opcional
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  imagen: { type: String, default: 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png' } // URL imagen predefinida o subida por el usuario
}, { timestamps: true });

module.exports = mongoose.model('Personaje', personajeSchema);