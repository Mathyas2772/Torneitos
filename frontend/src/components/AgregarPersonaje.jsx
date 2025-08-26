import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AgregarPersonaje() {
  const [formData, setFormData] = useState({
    nombre: '', origen: '', tipo: 'anime', habilidades: '', fuerza: '', descripcion: '', imagen: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateImageUrl = (url) => {
    if (!url) return true; // Imagen opcional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageLoadError = () => {
    setImageError('La imagen no pudo cargarse. Usa una URL válida.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Por favor, inicia sesión primero');
        navigate('/login');
        return;
      }
      await axios.post('http://localhost:5000/personajes', {
        ...formData,
        habilidades: formData.habilidades ? formData.habilidades.split(',').map(h => h.trim()) : [],
        imagen: formData.imagen || 'https://placehold.co/150x150' // Imagen por defecto si no se proporciona
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Personaje creado');
      setFormData({ nombre: '', origen: '', tipo: 'anime', habilidades: '', fuerza: '', descripcion: '', imagen: '' });
      setError('');
      navigate('/lista'); // Redirige a la lista
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear personaje');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Agregar Personaje</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre (ej: Goku)"
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            value={formData.origen}
            onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
            placeholder="Origen (ej: Dragon Ball)"
          />
        </div>
        <div className="mb-3">
          <select
            className="form-select"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <option value="anime">Anime</option>
            <option value="pelicula">Película</option>
            <option value="comic">Cómic/Manga</option>
            <option value="videojuego">Videojuego</option>
            <option value="original">Original</option>
          </select>
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            value={formData.habilidades}
            onChange={(e) => setFormData({ ...formData, habilidades: e.target.value })}
            placeholder="Habilidades (separadas por comas)"
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="number"
            value={formData.fuerza}
            onChange={(e) => setFormData({ ...formData, fuerza: e.target.value })}
            placeholder="Fuerza (1-100)"
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            value={formData.imagen}
            onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
            placeholder="URL de la imagen (opcional)"
          />
          {formData.imagen && (
            <img
              src={formData.imagen}
              alt="Vista previa"
              style={{ width: '100px', height: '100px', marginTop: '10px' }}
              onError={handleImageLoadError}
            />
          )}
        </div>
        {formData.tipo === 'original' && (
          <div className="mb-3">
            <textarea
              className="form-control"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del personaje (opcional)"
            />
          </div>
        )}
        <button className="btn btn-primary" type="submit">Agregar</button>
      </form>
    </div>
  );
}

export default AgregarPersonaje;