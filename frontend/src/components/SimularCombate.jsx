import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SimularCombate() {
  const [personajes, setPersonajes] = useState([]);
  const [personaje1, setPersonaje1] = useState('');
  const [personaje2, setPersonaje2] = useState('');
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get('http://localhost:5000/personajes', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setPersonajes(response.data))
      .catch(error => setError('Error al obtener personajes'));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personaje1 || !personaje2) {
      setError('Selecciona dos combatientes');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/combates', {
        personaje1,
        personaje2
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResultado(response.data.resultado);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al simular combate');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Simular Combate</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <select
            className="form-select"
            value={personaje1}
            onChange={(e) => setPersonaje1(e.target.value)}
          >
            <option value="">Selecciona Combatiente 1</option>
            {personajes.map(p => (
              <option key={p._id} value={p._id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <select
            className="form-select"
            value={personaje2}
            onChange={(e) => setPersonaje2(e.target.value)}
          >
            <option value="">Selecciona Combatiente 2</option>
            {personajes.map(p => (
              <option key={p._id} value={p._id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Simular</button>
      </form>
      {resultado && (
        <div className="mt-3 alert alert-success animate__animated animate__fadeIn">
          {resultado}
        </div>
      )}
    </div>
  );
}

export default SimularCombate;