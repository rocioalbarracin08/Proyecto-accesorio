import "./App.css"
import { Login } from "./components/login/Login";
import { BarraNavegacion } from "./components/navegacion/Navegacion";
import { PiePagina } from "./components/piePagina/PiePag";
import { Destacados } from './components/productosDestacados/Destacado';
import {  Routes, Route } from 'react-router-dom';

function App() {
  
  return (
    <>
      <BarraNavegacion/>

        <Routes>
          <Route path="/login" element={<Login/>} />
        </Routes>
      <PiePagina/>
    </>
  );
}
/*
<div className='contenDest'> 
        <Destacados/>
      </div>     
      <PiePagina/> 
<BarraNavegacion />
<PiePagina/>
<div className='recuadro'> 
        <Login/>
      </div>
*/
export default App;
