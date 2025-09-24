import { useState } from 'react';
import './App.css';

import { BarraNavegacion } from './components/navegacion/Navegacion';
import { PiePagina } from './components/piePagina/PiePag';

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

  return 
  (
    <Functions/>
  )


    <>
      <BarraNavegacion />
      <PiePagina/>
    </>
  );

}

export default App;
