import { useState } from 'react';
import './App.css';

import { BarraNavegacion } from './components/navegacion/Navegacion';
import { PiePagina } from './components/piePagina/PiePag';
import { Login } from './components/Login/Login';
import { Home } from './components/Home/Home';

function App() {

  const [user, setUser] = useState([]);

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
      
      {! user.length >0  
        ? <Login setUser={setUser}/>
        : <Home user = {user}/>
      }
    </>
  );

}

export default App;
