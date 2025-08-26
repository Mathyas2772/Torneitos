const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enfrentamientoSchema = new Schema({
  participante1: { type: Schema.Types.ObjectId, ref: 'Personaje' },
  participante2: { type: Schema.Types.ObjectId, ref: 'Personaje' }
}, { _id: false }); // No necesita _id propio

const torneoSchema = new Schema({
  nombre: { type: String, required: true },
  participantes: [{ type: Schema.Types.ObjectId, ref: 'Personaje' }],
  enfrentamientos: [[ enfrentamientoSchema ]], // Array de rondas, cada ronda es un array de enfrentamientos (objetos)
  ganador: { type: Schema.Types.ObjectId, ref: 'Personaje', default: null },
  subcampeon: { type: Schema.Types.ObjectId, ref: 'Personaje', default: null },
  eliminados: [{ type: Schema.Types.ObjectId, ref: 'Personaje' }],
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  estado: { type: String, enum: ['activo', 'finalizado'], default: 'activo' },
  rondaActual: { type: Number, default: 0 }, // 0: octavos, 1: cuartos, 2: semis, 3: final
  ganadoresRonda: [{ type: Schema.Types.ObjectId, ref: 'Personaje' }]
}, { timestamps: true });

module.exports = mongoose.model('Torneo', torneoSchema);