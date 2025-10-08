import React, { useState } from "react";
import "./App.css"
import { Login } from "./components/login/Login";
import { BarraNavegacion } from "./components/navegacion/Navegacion";
import { PiePagina } from "./components/piePagina/PiePag";
import { Destacados } from './components/productosDestacados/Destacado';
import {  Routes, Route } from 'react-router-dom';
import { Registrarse } from "./components/registro/Registrarse";
import { ProductoGrid } from "./components/producto/Producto";

function App() {
  
  return (
    <>
    <body>
      <BarraNavegacion/>
        <ProductoGrid/>

        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/registro" element={<Registrarse/>} />
        </Routes>

      <PiePagina/>
    </body>
    </>
  );
}

export default App;
