import { useState } from 'react';
import './App.css';
import { BarraNavegacion } from './components/navegacion/Navegacion';
import { PiePagina } from './components/piePagina/PiePag';
import { Login } from './components/Login/Login';
import { Home } from './components/Home/Home';

function App() {

  const [user, setUser] = useState([]);

  return (
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
