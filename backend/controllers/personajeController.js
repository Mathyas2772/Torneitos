const Personaje = require('../models/personaje');
const Usuario = require('../models/usuario');

const createPersonaje = async (req, res) => {
  try {
    // Asociar el personaje al usuario autenticado
    console.log('Creando personaje para usuario:', req.userId);
    const { nombre, origen, tipo, habilidades, fuerza, descripcion, imagen } = req.body;
    const personaje = await Personaje.create({
      nombre,
      origen,
      tipo,
      habilidades,
      fuerza,
      descripcion,
      imagen: imagen || 'https://via.placeholder.com/150',
      usuario: req.userId
    });
    await Usuario.findByIdAndUpdate(req.userId, { $push: { personajes: personaje._id } });
    res.status(201).json(personaje);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPersonajes = async (req, res) => {
  try {
    // Solo obtener personajes del usuario autenticado
    console.log('Obteniendo personajes para usuario:', req.userId);
    const personajes = await Personaje.find({ usuario: req.userId });
    res.json(personajes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePersonaje = async (req, res) => {
  try {
    const { nombre, origen, tipo, habilidades, fuerza, descripcion, imagen } = req.body;
    const personaje = await Personaje.findOneAndUpdate(
      { _id: req.params.id, usuario: req.userId },
      { nombre, origen, tipo, habilidades, fuerza, descripcion, imagen: imagen || 'https://via.placeholder.com/150' },
      { new: true }
    );
    if (!personaje) return res.status(404).json({ message: 'Personaje no encontrado' });
    res.json(personaje);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePersonaje = async (req, res) => {
  try {
    const personaje = await Personaje.findOneAndDelete({ _id: req.params.id, usuario: req.userId });
    if (!personaje) return res.status(404).json({ message: 'Personaje no encontrado' });
    await Usuario.findByIdAndUpdate(req.userId, { $pull: { personajes: req.params.id } });
    res.json({ message: 'Personaje eliminado' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getPersonajes, createPersonaje, updatePersonaje, deletePersonaje };