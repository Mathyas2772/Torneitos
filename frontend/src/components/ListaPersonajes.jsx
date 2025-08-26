import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ListaPersonajes() {
  const [personajes, setPersonajes] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', origen: '', tipo: 'anime', habilidades: '', fuerza: '', descripcion: '', imagen: '' });
  const navigate = useNavigate();

  const fetchPersonajes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Por favor, inicia sesión');
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/personajes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersonajes(response.data || []);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al obtener personajes');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchPersonajes();
  }, [navigate]);

  const handleEdit = (personaje) => {
    setEditingId(personaje._id);
    setEditForm({
      nombre: personaje.nombre || '',
      origen: personaje.origen || '',
      tipo: personaje.tipo || 'anime',
      habilidades: personaje.habilidades?.join(', ') || '',
      fuerza: personaje.fuerza || '',
      descripcion: personaje.descripcion || '',
      imagen: personaje.imagen || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/personajes/${editingId}`, {
        ...editForm,
        habilidades: editForm.habilidades ? editForm.habilidades.split(',').map(h => h.trim()) : [],
        imagen: editForm.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      setEditForm({ nombre: '', origen: '', tipo: 'anime', habilidades: '', fuerza: '', descripcion: '', imagen: '' });
      fetchPersonajes();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar personaje');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este personaje?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/personajes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPersonajes();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar personaje');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lista de Personajes</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {editingId && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>Editar Personaje</h5>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <input
                  className="form-control"
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  placeholder="Nombre"
                />
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  type="text"
                  value={editForm.origen}
                  onChange={(e) => setEditForm({ ...editForm, origen: e.target.value })}
                  placeholder="Origen"
                />
              </div>
              <div className="mb-3">
                <select
                  className="form-select"
                  value={editForm.tipo}
                  onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
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
                  value={editForm.habilidades}
                  onChange={(e) => setEditForm({ ...editForm, habilidades: e.target.value })}
                  placeholder="Habilidades (separadas por comas)"
                />
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  type="number"
                  value={editForm.fuerza}
                  onChange={(e) => setEditForm({ ...editForm, fuerza: e.target.value })}
                  placeholder="Fuerza (1-100)"
                />
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  type="text"
                  value={editForm.imagen}
                  onChange={(e) => setEditForm({ ...editForm, imagen: e.target.value })}
                  placeholder="URL de la imagen (opcional)"
                />
                {editForm.imagen && (
                  <img
                    src={editForm.imagen}
                    alt="Vista previa"
                    style={{ width: '100px', height: '100px', marginTop: '10px', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                  />
                )}
              </div>
              {editForm.tipo === 'original' && (
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    value={editForm.descripcion}
                    onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                    placeholder="Descripción (opcional)"
                  />
                </div>
              )}
              <button className="btn btn-primary me-2" type="submit">Guardar</button>
              <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {personajes.length === 0 && !error ? (
        <p>No hay personajes registrados</p>
      ) : (
        <div className="row">
          {personajes.map(p => (
            <div key={p._id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img
                    src={p.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                    className="card-img-top"
                    alt={p.nombre || 'Personaje'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title">{p.nombre || 'N/A'}</h5>
                  <p className="card-text">
                    {p.origen || 'N/A'} ({p.tipo || 'N/A'}) - Fuerza: {p.fuerza || 'N/A'}
                  </p>
                  {p.descripcion && <p className="card-text">Descripción: {p.descripcion}</p>}
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(p)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaPersonajes;