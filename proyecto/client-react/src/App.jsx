import { useState } from 'react';
import './App.css';
import { BarraNavegacion } from './components/navegacion/Navegacion';
import { PiePagina } from './components/piePagina/PiePag';
import { Login } from './components/Login/Login';


function App() {
  
  return (
    <>
      <div className='recuadro'> 
        <Login/>
      </div>
      
    </>
  );
}
/*
<BarraNavegacion />
<PiePagina/>
*/
export default App;
