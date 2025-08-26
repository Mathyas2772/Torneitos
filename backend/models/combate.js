const mongoose = require('mongoose');

const combateSchema = new mongoose.Schema({
  torneo: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo' },
  personaje1: { type: mongoose.Schema.Types.ObjectId, ref: 'Personaje', required: true },
  personaje2: { type: mongoose.Schema.Types.ObjectId, ref: 'Personaje', required: true },
  ganador: { type: mongoose.Schema.Types.ObjectId, ref: 'Personaje' },
  habilidadUsada: { type: String },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Combate', combateSchema);