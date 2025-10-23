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
<<<<<<< HEAD
import { Productos } from "./components/producto/Productos";  
import { CarritoProvider } from "./context/CarritoContext";
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
=======
import { Productos } from "./components/producto/Productos"; 
import Nosotros from "./components/infoCompany/Nosotros";
import PerfilUser from "./components/perfilUsuario/PerfilUser";
import RegistrarEmpleado from "./components/empleados/RegistrarEmpleados"; 
import RecuperarContrasena from "./components/recuperar-contrasena/RecuperarContrasena";
import ResetearContrasena from "./components/resetear-contrasena/ResetearContrasena";
import CarruselPromociones from './components/promociones/CarruselPromociones';
import CambiarContrasena from "./components/cambiar-contrasena/CambiarContrasena";
import CrearPromocion from "./components/promociones/CrearPromocion";
import Promociones from "./components/promociones/Promociones";
import EditarPromocion from "./components/promociones/EditarPromocion";


function App() {
  return (
    <Routes>
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/resetear-contrasena" element={<ResetearContrasena/>}/>
      <Route path="/cambiar-contrasena" element={<CambiarContrasena/>}/>
      <Route path="/crear-promocion" element={<CrearPromocion/>}/>
      <Route path="/promociones" element={<Promociones/>}/>
      <Route path="/editarPromociones" element={<EditarPromocion/>}/>
      <Route
        path="/"
        element={
          <>
            <BarraNavegacion />
            <CarruselPromociones /> 
            <Destacados />
            <Categorizados />  {/* Muestra categorías en home */}
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
      <Route path="/nosotros" element={
        <>
        <BarraNavegacion/>
        <Nosotros/>
        <PiePagina/>
        </>
        }></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/perfil" element={
        <>
        <BarraNavegacion />
        <PerfilUser />
        <PiePagina />
        </>
      } />
      <Route path="/registro" element={<Registrarse />} />
      {/* NUEVA: Ruta para registrar empleados (protegida, solo dueño) */}
      <Route path="/registrar-empleado" element={
        <> 
        <BarraNavegacion /> 
        <RegistrarEmpleado /> 
        <PiePagina /> 
      </>} />
    
    </Routes>
>>>>>>> 5fe2e09f94e94f4bb3d420092b0099ea05c534b9
  );
}

export default App;
