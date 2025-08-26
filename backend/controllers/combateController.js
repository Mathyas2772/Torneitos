const Personaje = require('../models/personaje');
const Combate = require('../models/combate');

const simularCombate = async (req, res) => {
  try {
    const { personaje1, personaje2 } = req.body;
    if (!personaje1 || !personaje2) {
      return res.status(400).json({ message: 'Se requieren dos combatientes' });
    }

    const p1 = await Personaje.findOne({ _id: personaje1, usuario: req.userId });
    const p2 = await Personaje.findOne({ _id: personaje2, usuario: req.userId });

    if (!p1 || !p2) {
      return res.status(404).json({ message: 'Personaje no encontrado o no pertenece al usuario' });
    }

    // Lógica simple: el personaje con más fuerza tiene mayor probabilidad de ganar
    const probabilidadP1 = p1.fuerza / (p1.fuerza + p2.fuerza);
    const ganador = Math.random() < probabilidadP1 ? p1 : p2;
    const habilidadUsada = ganador.habilidades[Math.floor(Math.random() * ganador.habilidades.length)];

    const combate = await Combate.create({
      personaje1,
      personaje2,
      ganador: ganador._id,
      habilidadUsada,
      usuario: req.userId
    });

    res.json({
      resultado: `${ganador.nombre} derrotó a ${ganador._id === p1._id ? p2.nombre : p1.nombre} usando ${habilidadUsada}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { simularCombate };