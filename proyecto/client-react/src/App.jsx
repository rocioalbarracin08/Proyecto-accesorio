import "./App.css";
import { Perfil } from "./components/perfil";
import { Login } from "./components/login/Login";
import { BarraNavegacion } from "./components/navegacion/Navegacion";
import { PiePagina } from "./components/piePagina/PiePag";
import { Destacados } from "./components/productosDestacados/Destacado";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Registrarse } from "./components/registro/Registrarse";
import { ProductoGrid } from "./components/producto/ProductoGrid";
import { Categorizados } from "./components/categorias/Categorizados"; 
import { Productos } from "./components/producto/Productos";  //Importa Productos

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <BarraNavegacion />
              <Destacados />
              <Categorizados />  {/* Muestra categorías en home */}
              <Perfil />
              <PiePagina />
            </>
          }
        />
        <Route
          path="/productos"
          element={
            <>
              <BarraNavegacion />
              <ProductoGrid />  {/* Productos generales */}
              <Perfil />
              <PiePagina />
            </>
          }
        />
        <Route
          path="/productos/:idCategoria"
          element={
            <>
              <BarraNavegacion />
              <Productos />  {/* Componente para productos FILTRADOS */}
              <Perfil />
              <PiePagina />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registrarse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;