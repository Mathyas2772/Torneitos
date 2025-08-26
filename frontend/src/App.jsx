import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AgregarPersonaje from './components/AgregarPersonaje.jsx';
import ListaPersonajes from './components/ListaPersonajes.jsx';
import Registrar from './components/Registrar.jsx';
import Login from './components/Login.jsx';
import SimularCombate from './components/SimularCombate.jsx';
import AgregarTorneo from './components/AgregarTorneo.jsx';
import ListaTorneos from './components/ListaTorneos.jsx';
import Torneo from './components/Torneo.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Inicialmente null para indicar carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        // Verificar el token con una solicitud al servidor
        await axios.get('http://localhost:5000/personajes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al verificar token:', error.response?.data?.message || error.message);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  if (loading) {
    return <div className="container mt-4">Cargando...</div>;
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Torneitos</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav">
              {!isAuthenticated ? (
                <>
                  <Link className="nav-link" to="/registrar">Registrar</Link>
                  <Link className="nav-link" to="/login">Iniciar Sesión</Link>
                </>
              ) : (
                <>
                  <Link className="nav-link" to="/personajes">Agregar Personaje</Link>
                  <Link className="nav-link" to="/lista">Lista de Personajes</Link>
                  <Link className="nav-link" to="/combate">Simular Combate</Link>
                  <Link className="nav-link" to="/torneo">Crear Torneo</Link>
                  <Link className="nav-link" to="/lista-torneos">Lista de Torneos</Link>
                  <button
                    className="nav-link btn"
                    onClick={() => {
                      localStorage.removeItem('token');
                      setIsAuthenticated(false);
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/registrar" element={isAuthenticated ? <Navigate to="/lista" /> : <Registrar />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/lista" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/personajes"
          element={isAuthenticated ? <AgregarPersonaje /> : <Navigate to="/login" />}
        />
        <Route
          path="/lista"
          element={isAuthenticated ? <ListaPersonajes /> : <Navigate to="/login" />}
        />
        <Route
          path="/combate"
          element={isAuthenticated ? <SimularCombate /> : <Navigate to="/login" />}
        />
        <Route
          path="/torneo"
          element={isAuthenticated ? <AgregarTorneo /> : <Navigate to="/login" />}
        />
        <Route
          path="/lista-torneos"
          element={isAuthenticated ? <ListaTorneos /> : <Navigate to="/login" />}
        />
        <Route
          path="/torneos/:id"
          element={isAuthenticated ? <Torneo /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/lista" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;