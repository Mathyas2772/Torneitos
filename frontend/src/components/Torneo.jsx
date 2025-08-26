import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function Torneo() {
  const { id } = useParams();
  const [torneo, setTorneo] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTorneo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/torneos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTorneo(response.data);
        setError('');
      } catch (error) {
        console.log('Torneo recibido:', torneo);
        console.error('Error al obtener torneo:', error.response?.data);
        setError(error.response?.data?.message || 'Error al obtener torneo');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchTorneo();
  }, [id, navigate]); // Dependencias limitadas para evitar solicitudes duplicadas

  const handleSimularCombate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/torneos/${id}/simular`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTorneo(response.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al simular combate');
    }
  };

  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!torneo) return <div className="container mt-4">Cargando...</div>;

  const getFaseActual = () => {
    if (torneo.estado === 'finalizado') return 'Finalizado';
    const tamano = torneo.participantes?.length || 4;
    if (tamano === 4) {
      return torneo.rondaActual === 0 ? 'Semifinales' : 'Final';
    }
    if (tamano === 8) {
      return torneo.rondaActual === 0 ? 'Cuartos de Final' : torneo.rondaActual === 1 ? 'Semifinales' : 'Final';
    }
    return torneo.rondaActual === 0 ? 'Octavos de Final' : torneo.rondaActual === 1 ? 'Cuartos de Final' : torneo.rondaActual === 2 ? 'Semifinales' : 'Final';
  };

  const proximoCombate = torneo.estado !== 'finalizado' && torneo.enfrentamientos?.[torneo.rondaActual]?.[0]
  ? `${torneo.enfrentamientos[torneo.rondaActual][0].participante1?.nombre || 'Desconocido'} vs ${torneo.enfrentamientos[torneo.rondaActual][0].participante2?.nombre || 'Desconocido'}`
  : null;

  const participantesActivos = (torneo.participantes || []).filter(p => 
    !(torneo.eliminados || []).some(e => e._id.toString() === p._id.toString())
  );

  return (
    <div className="container mt-4">
      <h2 className="text-center">{torneo.nombre || 'Torneo'} ({torneo.estado || 'N/A'})</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-3">
          <h4>Participantes</h4>
          <ul className="list-group mb-3">
            {participantesActivos.map(p => (
              <li key={p._id} className="list-group-item">
                <img
                  src={p.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                  alt={p.nombre || 'Personaje'}
                  style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                  onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                />
                {p.nombre || 'N/A'}
              </li>
            ))}
          </ul>
          <h4>Eliminados</h4>
          <ul className="list-group">
            {(torneo.eliminados || []).map(p => (
              <li key={p._id} className="list-group-item text-muted">
                <img
                  src={p.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                  alt={p.nombre || 'Personaje'}
                  style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                  onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                />
                {p.nombre || 'N/A'}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6 text-center">
          {torneo.estado !== 'finalizado' && proximoCombate && (
            <>
              <h4>Combate Actual ({getFaseActual()})</h4>
              <p className="alert alert-info">{proximoCombate}</p>
              <button className="btn btn-primary" onClick={handleSimularCombate}>
                Simular Combate
              </button>
            </>
          )}
          {torneo.estado === 'finalizado' && (
            <div>
              <p className="alert alert-success">
                Ganador: <img
                  src={torneo.ganador?.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                  alt={torneo.ganador?.nombre || 'N/A'}
                  style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                  onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                />
                {torneo.ganador?.nombre || 'N/A'}
              </p>
              {torneo.subcampeon && (
                <p className="alert alert-info">
                  Subcampeón: <img
                    src={torneo.subcampeon.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                    alt={torneo.subcampeon.nombre || 'N/A'}
                    style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                    onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                  />
                  {torneo.subcampeon.nombre || 'N/A'}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="col-md-3">
          <h4>Rondas</h4>
          {(torneo.enfrentamientos || []).map((ronda, index) => {
            const fases = torneo.participantes?.length === 4
              ? ['Semifinales', 'Final']
              : torneo.participantes?.length === 8
                ? ['Cuartos de Final', 'Semifinales', 'Final']
                : ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final'];
            if (index >= fases.length) return null;
            const nombreFase = fases[index];
            return (
              <div key={index} className="mb-3">
                <h5>{nombreFase}</h5>
                <ul className="list-group">
                  {(ronda || []).map((par, i) => (
                    <li key={i} className="list-group-item">
                      <img
                        src={par.participante1?.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                        alt={par.participante1?.nombre || 'Desconocido'}
                        style={{ width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
                        onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                      />
                      {par.participante1?.nombre || 'Desconocido'} vs
                      <img
                        src={par.participante2?.imagen || 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'}
                        alt={par.participante2?.nombre || 'Desconocido'}
                        style={{ width: '24px', height: '24px', marginLeft: '8px', marginRight: '8px', verticalAlign: 'middle' }}
                        onError={(e) => { e.target.src = 'https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png'; }}
                      />
                      {par.participante2?.nombre || 'Desconocido'}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Torneo;