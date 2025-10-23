import "./App.css";
import { Perfil } from "./components/perfil";
import { Login } from "./components/login/Login";
import { BarraNavegacion } from "./components/navegacion/Navegacion";
import { PiePagina } from "./components/piePagina/PiePag";
import { Destacados } from "./components/productosDestacados/Destacado";
import { Routes, Route } from "react-router-dom";
import { Registrarse } from "./components/registro/Registrarse";
import { ProductoGrid } from "./components/producto/ProductoGrid";
import { Categorizados } from "./components/categorias/Categorizados"; 
import { Productos } from "./components/producto/Productos";  
import { CarritoProvider } from "./contexts/CarritoContext";
import { Factura } from "./components/factura/factura"; // crea esta página

function App() {
  return (
    <CarritoProvider>
      <BrowserRouter>
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
          <Route
            path="/productos"
            element={
              <>
                <BarraNavegacion />
                <ProductoGrid />  
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
                <Productos />  
                <Perfil />
                <PiePagina />
              </>
            }
          />
          <Route
            path="/factura"
            element={
              <>
                <BarraNavegacion />
                <Factura />  {/* Página de factura */}
                <PiePagina />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registrarse />} />
        </Routes>
      </BrowserRouter>
    </CarritoProvider>
  );
}

export default App;
