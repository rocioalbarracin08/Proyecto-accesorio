import './nav.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useState } from "react";
import { useCarrito } from '../../context/CarritoContext';  // Importa context (verifica ruta)

export function BarraNavegacion() {
  const { isLogged, logout } = useAuthContext(); 
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');  // Estado para búsqueda (sin funcionalidad por ahora)
  const { state, toggleCarrito, closeCarrito } = useCarrito();  // Agregué closeCarrito para cerrar modal correctamente

  const handleLogout = async () => {
    await fetch("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include"
    });
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="encabezado">
        <Link to="/"> 
          <img src="/logos/fondo.jpg" className="miLogo" alt="Logo de la tienda" />
        </Link>

        <Link to="/" className='direccionamiento'>Inicio</Link> 
        <Link to="/productos" className='direccionamiento'>Tienda</Link>
        <Link to="/nosotros" className='direccionamiento'>Nosotros</Link>  

        <input 
          className='buscador'
          type="text"
          placeholder='Buscar producto'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
        <div className='iconosUser'>
          {isLogged ? (
            <button onClick={handleLogout} className="btn-cerrarSesion">
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className='user'>
              <img src="/logos/vectorUsuario.png" alt="Iniciar sesión" />
            </Link>
          )}
          {/* Botón carrito: toggle para abrir, con badge y aria-label para accesibilidad */}
          <button 
            onClick={toggleCarrito}
            className='carrito'
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            aria-label={`Ver carrito (${state.totalItems} items)`} 
          >
            <img src="/logos/carrito.png" alt="Ícono de carrito de compras" />
            {state.totalItems > 0 && (
              <span className="carrito-count" aria-hidden="true">{state.totalItems}</span> 
            )}
          </button>
        </div>
      </header>

      {/* Modal del carrito (siempre accesible, público) */}
      {state.showCarrito && (
        <div className="modal-carrito">
          <h2>Carrito</h2>
          <p>Total: ${state.totalPrice}</p>
        </div>
      )}

    </>
  );
}