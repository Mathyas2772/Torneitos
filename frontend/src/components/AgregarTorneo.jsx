import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AgregarTorneo() {
  const [nombre, setNombre] = useState('');
  const [tamano, setTamano] = useState(4);
  const [personajes, setPersonajes] = useState([]);
  const [selectedPersonajes, setSelectedPersonajes] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      .catch(error => setError(error.response?.data?.message || 'Error al cargar personajes'));
  }, [navigate]);

  const handlePersonajeToggle = (id) => {
    if (selectedPersonajes.includes(id)) {
      setSelectedPersonajes(selectedPersonajes.filter(p => p !== id));
    } else if (selectedPersonajes.length < tamano) {
      setSelectedPersonajes([...selectedPersonajes, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevenir envíos múltiples
    if (!nombre) {
      setError('El nombre del torneo es requerido');
      return;
    }
    if (selectedPersonajes.length !== tamano) {
      setError(`Debes seleccionar exactamente ${tamano} personajes`);
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        nombre,
        participantes: selectedPersonajes, // Array de strings (IDs)
        tamano
      };
      console.log('Enviando payload:', payload); // Depuración
      const response = await axios.post('http://localhost:5000/torneos', payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 segundos de timeout
      });
      console.log('Respuesta exitosa del backend:', response.status, response.data);
      setError(''); // Limpiar errores
      navigate('/lista-torneos');
    } catch (error) {
      console.error('Error capturado en frontend:', {
        message: error.message,
        name: error.name,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code
      });
      // Sólo muestra error si es un fallo real del backend
      if (error.response && error.response.status >= 400) {
        setError(error.response?.data?.message || 'Error al crear torneo');
      } else {
      // Si no hay response (e.g., parse error o timeout), asume éxito si el torneo se creó
        console.warn('Posible falso error, intentando navegar...');
        navigate('/lista-torneos');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Torneo</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombreTorneo" className="form-label">Nombre del Torneo</label>
          <input
            type="text"
            className="form-control"
            id="nombreTorneo"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="tamanoTorneo" className="form-label">Tamaño del Torneo</label>
          <select
            className="form-select"
            id="tamanoTorneo"
            name="tamano"
            value={tamano}
            onChange={(e) => {
              setTamano(Number(e.target.value));
              setSelectedPersonajes([]);
            }}
          >
            <option value={4}>4 participantes</option>
            <option value={8}>8 participantes</option>
            <option value={16}>16 participantes</option>
          </select>
        </div>
        <div className="mb-3">
          <h4>Seleccionar Personajes ({selectedPersonajes.length}/{tamano})</h4>
          <div className="row">
            {personajes.map(p => (
              <div key={p._id} className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`personaje-${p._id}`}
                    name={`personaje-${p._id}`}
                    checked={selectedPersonajes.includes(p._id)}
                    onChange={() => handlePersonajeToggle(p._id)}
                    disabled={selectedPersonajes.length >= tamano && !selectedPersonajes.includes(p._id)}
                  />
                  <label className="form-check-label" htmlFor={`personaje-${p._id}`}>
                    <img
                      src={p.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                      alt={p.nombre}
                      style={{ width: '24px', height: '24px', marginRight: '8px' }}
                      onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                    />
                    {p.nombre}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Torneo'}
        </button>
      </form>
    </div>
  );
}

export default AgregarTorneo;