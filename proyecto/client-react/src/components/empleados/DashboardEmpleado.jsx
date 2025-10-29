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
  const [nombreTienda, setNombreTienda] = useState('Asignada'); 

  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setPerfil(data);
        if (data.id_tienda) {
          fetch("http://localhost:5000/tienda/", { credentials: "include" })
            .then(res => res.json())
            .then(tiendas => {
              const tienda = tiendas.find(t => t.id_tienda === data.id_tienda);
              setNombreTienda(tienda ? tienda.nombre : 'Asignada');
            })
            .catch(err => console.error('Error obteniendo tienda:', err));
        }
      });
  }, []);

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
      <h1>Panel de Empleado</h1>
      <div className="perfil-info">
        <span className="tienda">Tienda: {nombreTienda || 'Asignada'}</span>  
        <button onClick={logout} className="btn-cerrarS">Cerrar Sesión</button>
      </div>
      

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

      <Link to="/" className="volver">Volver a Inicio</Link>
    </div>
  );
}