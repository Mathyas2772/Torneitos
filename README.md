# Torneitos

## Descripción
Este proyecto es una aplicación full-stack para crear y simular torneos de eliminación simple con personajes personalizados. Inspirado en series, películas y video juegos, permite a usuarios registrarse, crear personajes (con nombre, origen, imagen opcional y fuerza), formar torneos de 4, 8 o 16 participantes, simular combates paso a paso (con lógica de fuerza + aleatoriedad), y ver resultados en tiempo real. Construido con el stack MERN (MongoDB, Express, React, Node.js).

Mi idea con este proyecto es demostrar mis habilidades en desarrollo web, APIs REST, autenticación JWT, y lógica de algoritmos (barajado, simulación).

## Tecnologías Usadas
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT, Bcrypt.
- **Frontend**: React, React Router, Axios, Bootstrap, Vite.
- **Base de Datos**: MongoDB.
- **Otras**: Dotenv para env vars, CORS para cross-origin.

## Instalación
1. Clona el repo: `git clone https://github.com/Mathyas2772/Torneitos.git`
2. Backend:
   - `cd backend`
   - `npm install`
   - Instalar MongoDB (recomiendo crear una cuenta gratis en Atlas, crear un cluster y generar una URI) y reemplazar código en `backend/.env` con tus propios datos.
   - `npm start`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm start` (abre en http://localhost:3000)

## Uso
- Registrate/logueá.
- Crear personajes en `personajes/`.
- Crear torneos en `torneo/` (elegí tamaño y participantes).
- Simular combates en `torneos/:id` y progresar en el torneo.
- Ver listas en `lista-torneos/` y `lista/`.
- Simular combates individuales fuera de torneos en `combate/`.

## Funcionalidades Principales
- Autenticación segura con JWT.
- CRUD para personajes y torneos.
- Simulación de combates con probabilidades basadas en atributos.
- Visualización de brackets y resultados.

## Contribuciones
Pull requests bienvenidas. Para bugs, abre issues.

## Licencia
MIT License.
