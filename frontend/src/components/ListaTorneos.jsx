import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Componente para listar todos los torneos del usuario
function ListaTorneos() {
  const [torneos, setTorneos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar torneos al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get('http://localhost:5000/torneos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setTorneos(response.data))
      .catch(error => {
        setError(error.response?.data?.message || 'Error al obtener torneos');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      });
  }, [navigate]);

  // Eliminar un torneo
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este torneo?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/torneos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTorneos(torneos.filter(t => t._id !== id));
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar torneo');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lista de Torneos</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {torneos.length === 0 && !error ? (
        <p>No hay torneos registrados</p>
      ) : (
        <div className="row">
          {torneos.map(t => {
            const faseActual = t.estado === 'finalizado' ? 'Finalizado' : (
              t.participantes?.length === 4
                ? (t.rondaActual === 0 ? 'Semifinales' : 'Final')
                : t.participantes?.length === 8
                  ? (t.rondaActual === 0 ? 'Cuartos de Final' : t.rondaActual === 1 ? 'Semifinales' : 'Final')
                  : (t.rondaActual === 0 ? 'Octavos de Final' : t.rondaActual === 1 ? 'Cuartos de Final' : t.rondaActual === 2 ? 'Semifinales' : 'Final')
            );
            const proximoCombate = t.estado !== 'finalizado' && t.enfrentamientos?.[t.rondaActual]?.[0]
              ? `${t.enfrentamientos[t.rondaActual][0].participante1?.nombre || 'N/A'} vs ${t.enfrentamientos[t.rondaActual][0].participante2?.nombre || 'N/A'}`
              : null;
            const participantesRestantes = t.participantes?.length - (t.eliminados?.length || 0);

            return (
              <div key={t._id} className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{t.nombre || 'N/A'}</h5>
                    <p className="card-text">Estado: {t.estado || 'N/A'}</p>
                    {t.estado !== 'finalizado' && (
                      <>
                        <p className="card-text">Participantes restantes: {participantesRestantes}/{t.participantes?.length || 0}</p>
                        <p className="card-text">Fase actual: {faseActual}</p>
                        {proximoCombate && <p className="card-text">Próximo combate: {proximoCombate}</p>}
                      </>
                    )}
                    {t.estado === 'finalizado' && (
                      <>
                        <p className="card-text">
                          Ganador: <img
                            src={t.ganador?.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                            alt={t.ganador?.nombre || 'N/A'}
                            style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                            onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                          />
                          {t.ganador?.nombre || 'N/A'}
                        </p>
                        {t.subcampeon && (
                          <p className="card-text">
                            Subcampeón: <img
                              src={t.subcampeon.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                              alt={t.subcampeon.nombre || 'N/A'}
                              style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                              onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                            />
                            {t.subcampeon.nombre || 'N/A'}
                          </p>
                        )}
                      </>
                    )}
                    <Link to={`/torneos/${t._id}`} className="btn btn-primary btn-sm me-2">Ver Torneo</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ListaTorneos;