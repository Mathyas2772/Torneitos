const mongoose = require('mongoose');
const Torneo = require('../models/torneo');
const Usuario = require('../models/usuario');
const Personaje = require('../models/personaje');

const getTorneos = async (req, res) => {
  try {
    const torneos = await Torneo.find({ usuario: req.userId });
    const populatedTorneos = await Promise.all(torneos.map(t => populateTorneo(t)));
    console.log('Torneos poblados:', JSON.stringify(populatedTorneos, null, 2)); // Depuración
    res.json(populatedTorneos);
  } catch (error) {
    console.error('Error al obtener torneos:', error);
    res.status(500).json({ message: error.message });
  }
};

const populateTorneo = async (torneo) => {
  const populated = await torneo.populate([
    'participantes',
    'eliminados',
    'ganador',
    'subcampeon',
    { path: 'enfrentamientos.participante1', model: 'Personaje' },
    { path: 'enfrentamientos.participante2', model: 'Personaje' }
  ]);
  console.log('Torneo después de populate:', JSON.stringify(populated.enfrentamientos, null, 2));
  return populated;
};

const getTorneoById = async (req, res) => {
  try {
    const torneo = await Torneo.findOne({ _id: req.params.id, usuario: req.userId });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    const populatedTorneo = await populateTorneo(torneo);
    res.json(populatedTorneo);
  } catch (error) {
    console.error('Error al obtener torneo:', error);
    res.status(500).json({ message: error.message });
  }
};

const createTorneo = async (req, res) => {
  try {
    const { nombre, participantes, tamano } = req.body;
    console.log('Recibiendo solicitud para crear torneo:', { nombre, tamano, participantes });
    if (!nombre || !participantes || !tamano) {
      return res.status(400).json({ message: 'Nombre, participantes y tamaño son requeridos' });
    }
    if (![4, 8, 16].includes(tamano)) {
      return res.status(400).json({ message: 'Tamaño debe ser 4, 8 o 16' });
    }
    if (participantes.length !== tamano) {
      return res.status(400).json({ message: `Debe seleccionar exactamente ${tamano} personajes` });
    }

    const validIds = participantes.map(id => {
      try {
        return mongoose.Types.ObjectId.createFromHexString(id);
      } catch {
        throw new Error('ID de personaje inválido: ' + id);
      }
    });

    const personajesValidos = await Personaje.find({
      _id: { $in: validIds },
      usuario: req.userId
    });
    if (personajesValidos.length !== participantes.length) {
      return res.status(400).json({ message: 'Algunos personajes no son válidos o no te pertenecen' });
    }

    const shuffled = [...validIds].sort(() => 0.5 - Math.random());
    const enfrentamientos = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        enfrentamientos.push({ participante1: shuffled[i], participante2: shuffled[i + 1] });
      } else {
        enfrentamientos.push({ participante1: shuffled[i] }); // Pasa automáticamente si es impar
      }
    }

    console.log('Enfrentamientos antes de guardar:', JSON.stringify(enfrentamientos, null, 2));
    const torneo = await Torneo.create({
      nombre,
      participantes: validIds,
      enfrentamientos: [enfrentamientos], // Primera ronda
      eliminados: [],
      usuario: req.userId,
      rondaActual: 0,
      estado: 'activo',
    });
    await Usuario.findByIdAndUpdate(req.userId, { $push: { torneos: torneo._id } });
    const populatedTorneo = await populateTorneo(torneo);
    console.log('Torneo poblado:', JSON.stringify(populatedTorneo, null, 2));
    res.status(201).json(populatedTorneo);
  } catch (error) {
    console.error('Error al crear torneo:', error);
    res.status(400).json({ message: error.message });
  }
};

const simularCombate = async (req, res) => {
  try {
    const { id } = req.params;
    const torneo = await Torneo.findOne({ _id: id, usuario: req.userId });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    if (torneo.estado === 'finalizado') return res.status(400).json({ message: 'El torneo ya finalizó' });

    // Poblar inicialmente
    await populateTorneo(torneo);

    const rondaActual = torneo.rondaActual;
    const enfrentamientosActuales = torneo.enfrentamientos[rondaActual] || [];
    if (enfrentamientosActuales.length === 0) {
      return res.status(400).json({ message: 'No hay enfrentamientos en esta ronda' });
    }

    const combate = enfrentamientosActuales[0];
    if (!combate || !combate.participante1) {
      return res.status(400).json({ message: 'Combate inválido: estructura incorrecta' });
    }

    let ganador, perdedor;
    if (!combate.participante2) {
      ganador = combate.participante1; // Pasa automáticamente
    } else {
      const probabilidadP1 = combate.participante1.fuerza / (combate.participante1.fuerza + combate.participante2.fuerza);
      ganador = Math.random() < probabilidadP1 ? combate.participante1 : combate.participante2;
      perdedor = ganador === combate.participante1 ? combate.participante2 : combate.participante1;
      if (perdedor && !torneo.eliminados.some(e => e._id.toString() === perdedor._id.toString())) {
        torneo.eliminados.push(perdedor._id);
      }
    }

    // Remover el combate actual
    enfrentamientosActuales.shift();
    torneo.enfrentamientos[rondaActual] = enfrentamientosActuales;

    // Agregar el ganador a la lista temporal de ganadores
    if (!torneo.ganadoresRonda) torneo.ganadoresRonda = [];
    torneo.ganadoresRonda.push(ganador._id);

    // Si la ronda terminó
    if (enfrentamientosActuales.length === 0) {
      const ganadores = torneo.ganadoresRonda;
      torneo.ganadoresRonda = [];

      const maxRondas = Math.log2(torneo.participantes.length);
      if (torneo.rondaActual + 1 >= maxRondas) {
        torneo.estado = 'finalizado';
        torneo.ganador = ganadores[0];
        torneo.subcampeon = perdedor ? perdedor._id : null;
      } else {
        const nuevosEnfrentamientos = [];
        for (let i = 0; i < ganadores.length; i += 2) {
          if (i + 1 < ganadores.length) {
            nuevosEnfrentamientos.push({ participante1: ganadores[i], participante2: ganadores[i + 1] });
          } else {
            nuevosEnfrentamientos.push({ participante1: ganadores[i] });
          }
        }
        torneo.enfrentamientos.push(nuevosEnfrentamientos);
        torneo.rondaActual += 1;
      }
    }

    await torneo.save();
    res.json(await populateTorneo(torneo));
  } catch (error) {
    console.error('Error al simular combate:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteTorneo = async (req, res) => {
  try {
    const { id } = req.params;
    const torneo = await Torneo.findOneAndDelete({ _id: id, usuario: req.userId });
    if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
    await Usuario.findByIdAndUpdate(req.userId, { $pull: { torneos: id } });
    res.json({ message: 'Torneo eliminado' });
  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getTorneos, getTorneoById, createTorneo, simularCombate, deleteTorneo };