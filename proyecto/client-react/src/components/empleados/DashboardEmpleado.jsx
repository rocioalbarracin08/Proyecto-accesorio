import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Productos } from "../producto/Productos";// Componente unificado para productos
import RegistrarVenta from "../ventas/RegistrarVenta";  // Para registrar ventas
import HistorialVentas from '../ventas/HistorialVentas';
import './dashboardEmpleado.css';  // Estilos

export default function DashboardEmpleado() {
  const { isLogged, userRole, logout } = useAuthContext();
  const [seccionActiva, setSeccionActiva] = useState('productos');  // 'productos', 'ventas', 'historial'
  const [perfil, setPerfil] = useState({});

  useEffect(() => {
    if (!isLogged || userRole !== 'empleado') {
      window.location.href = '/login';
    } else {
      // Obtener perfil para mostrar nombre y tienda
      fetch("http://localhost:5000/usuarios/perfil", { credentials: "include" })
        .then(res => res.json())
        .then(data => setPerfil(data));
    }
  }, [isLogged, userRole]);

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'productos':
        return <Productos />;  // Grilla de productos con botones para empleados
      case 'ventas':
        return <RegistrarVenta />;  // Formulario de venta
      case 'historial':
        return <HistorialVentas />;  // Componente para ver ventas (crea uno simple)
      default:
        return <Productos />;
    }
  };

  return (
    <div className="dashboard-empleado">
      <header className="dashboard-header">
        <h1>Panel de Empleado</h1>
        <div className="header-info">
          <span>Hola, {perfil.nombre} {perfil.apellido}</span>
          <span>Tienda: {perfil.tienda || 'Asignada'}</span>  {/* Asume que agregas tienda al perfil */}
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={seccionActiva === 'productos' ? 'active' : ''} 
          onClick={() => setSeccionActiva('productos')}
        >
          Gestionar Productos
        </button>
        <button 
          className={seccionActiva === 'ventas' ? 'active' : ''} 
          onClick={() => setSeccionActiva('ventas')}
        >
          Registrar Venta
        </button>
        <button 
          className={seccionActiva === 'historial' ? 'active' : ''} 
          onClick={() => setSeccionActiva('historial')}
        >
          Ver Mis Ventas
        </button>
      </nav>

      <main className="dashboard-content">
        {renderSeccion()}
      </main>

      <footer className="dashboard-footer">
        <Link to="/">Volver a Inicio</Link>
      </footer>
    </div>
  );
}