import "./App.css";
import { Login } from "./components/login/Login";
import { BarraNavegacion } from "./components/navegacion/Navegacion";
import { PiePagina } from "./components/piePagina/PiePag";
import { Destacado } from "./components/productosDestacados/Destacado";
import { Destacados } from "./components/productosDestacados/Destacados";
import { Routes, Route } from "react-router-dom";
import { Registrarse } from "./components/registro/Registrarse";
import { Categorizados } from "./components/categorias/Categorizados";
import { Productos } from "./components/producto/Productos";
import Nosotros from "./components/infoCompany/Nosotros";
import PerfilUser from "./components/perfilUsuario/PerfilUser";
import RegistrarEmpleado from "./components/empleados/RegistrarEmpleados";
import RecuperarContrasena from "./components/recuperar-contrasena/RecuperarContrasena";
import CarruselPromociones from "./components/promociones/CarruselPromociones";
import CambiarContrasena from "./components/cambiar-contrasena/CambiarContrasena";
import ResetearContrasenaToken from "./components/resetear-contrasena/ResetearContrasenaToken";
import CrearPromocion from "./components/promociones/CrearPromocion";
import Promociones from "./components/promociones/Promociones";
import EditarPromocion from "./components/promociones/EditarPromocion";
import { Factura } from "./components/factura/factura";
import DiseñoMain from "./components/diseño-main/DiseñoMain";
import DashboardEmpleado from "./components/empleados/DashboardEmpleado";
import EditarDestacados from './components/productosDestacados/EditarDestacados';
import ProductoDetalle from './components/producto/ProductoDetalle';
import Categorias from "./components/categorias/Categorias";


function App() {
  return (
    <Routes>
      <Route path="/producto/:id_producto" element={
        <>
          <BarraNavegacion />
          <ProductoDetalle />
          <PiePagina />
        </>
      } />
      <Route path="/gestionCategorias" element={<Categorias/>}/>
      <Route path=""/>
      <Route path="/admin/destacados" element={<EditarDestacados />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/resetear-contrasena" element={<ResetearContrasenaToken />}/>
      <Route path="/dashboard-empleado" element={<DashboardEmpleado />}/>
      <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
      <Route path="/crear-promocion" element={<CrearPromocion />} />
      <Route path="/promociones" element={<Promociones />} />
      <Route path="/editarPromociones" element={<EditarPromocion />} />
      <Route path="/factura" element={<Factura />} />
      <Route path="/registro" element={<Registrarse />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <>
            <BarraNavegacion />
            <CarruselPromociones />
            <Destacado />
            <Categorizados /> {/* Muestra categorías en home */}
            <DiseñoMain />
            <Destacados/>
            <PiePagina />
          </>
        }
      />
      <Route
        path="/productos"
        element={
          <>
            <BarraNavegacion />
            <Productos />
            <PiePagina />
          </>
        }
      />
      <Route path="/productos/:idCategoria" element={
        <>
        <BarraNavegacion />
        <Productos />
        <PiePagina />
        </>} 
        />

      <Route
      path="/nosotros"
      element={
        <>
          <BarraNavegacion />
          <Nosotros />
          <PiePagina />
        </>
      }
      />
      <Route
      path="/nosotros/preguntas"
      element={
        <>
          <BarraNavegacion />
          <Nosotros />
          <PiePagina />
        </>
      }
      />

      <Route
        path="/nosotros"
        element={
          <>
            <BarraNavegacion />
            <Nosotros />
            <PiePagina />
          </>
        }
      />
      <Route
        path="/perfil"
        element={
          <>
            <BarraNavegacion />
            <PerfilUser />
            <PiePagina />
          </>
        }
      />
      {/* Ruta para registrar empleados (protegida, solo dueño) */}
      <Route
        path="/registrar-empleado"
        element={
          <>
            <BarraNavegacion />
            <RegistrarEmpleado />
            <PiePagina />
          </>
        }
      />
    </Routes>
  );
}

export default App;
