import { useState } from 'react';
import './App.css';
import { BarraNavegacion } from './components/navegacion/Navegacion';
import { PiePagina } from './components/piePagina/PiePag';

function App() {

  return (
    <>
      <BarraNavegacion />
      <PiePagina/>
    </>
  );
}

export default App;
