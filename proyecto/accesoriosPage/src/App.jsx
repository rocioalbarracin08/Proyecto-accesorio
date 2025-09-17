import { useState } from 'react';
import './App.css';

function App() {
  return (
    <div className="background-image">
      <h1>Bienvenido</h1>
      <input type="text" />
      <input type="text" />
      <button>Login</button>
      <a className="link">¿Perdiste tu contraseña?</a>
      <a>¿No tienes cuenta? Regístrate</a>
      <a>Volver</a>
    </div>
  );
}

export default App;
