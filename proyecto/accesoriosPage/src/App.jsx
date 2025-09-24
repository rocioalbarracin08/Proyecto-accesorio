import { useState } from 'react';
import './App.css';
<<<<<<< HEAD
=======
import { BarraNavegacion } from './components/navegacion/Navegacion';
import { PiePagina } from './components/piePagina/PiePag';
>>>>>>> cac949e70b5eca3e7b411fb52d0a2a4af1b801d6

function App() {

  return (
<<<<<<< HEAD
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

  return 
  (
    <Functions/>
  )

=======
    <>
      <BarraNavegacion />
      <PiePagina/>
    </>
  );
>>>>>>> cac949e70b5eca3e7b411fb52d0a2a4af1b801d6
}

export default App;
