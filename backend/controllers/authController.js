const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const registrar = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.create({ email, password });
    const token = jwt.sign({ id: usuario._id }, 'secreto', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: usuario._id }, 'secreto', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { registrar, login };