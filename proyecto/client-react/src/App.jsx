import "./App.css";
import { Perfil } from "./components/perfil";
import { Login } from "./components/login/Login";
import { BarraNavegacion } from "./components/navegacion/Navegacion";
import { PiePagina } from "./components/piePagina/PiePag";
import { Destacados } from "./components/productosDestacados/Destacado";
import { Routes, Route } from "react-router-dom";
import { Registrarse } from "./components/registro/Registrarse";
import { ProductoGrid } from "./components/producto/Producto";
import { Productos } from "./components/producto/productoCategory";
import { Categorizados } from "./components/categorias/productsCategorizados";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <BarraNavegacion />
            <Destacados />
            <Categorizados />
            <Perfil />
            <PiePagina />
          </>
        }
      />
      <Route path="/productos" element={
        <>
            <BarraNavegacion />
            <ProductoGrid />
            <Perfil />
            <PiePagina />
        </>
      } />
      <Route path="/productos/:categoria" element={<Productos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registrarse />} />
    </Routes>
  );
}


export default App;
