import './nav.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext'; // 👈 usa el hook del contexto
import { useState } from "react";

export function BarraNavegacion() {
  const { isLogged, logout } = useAuthContext(); 
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  const handleLogout = async () => {
    await fetch("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include"
    });
    logout(); // <-- usa el método global del contexto
    navigate("/login"); // redirige al login después de cerrar sesión
  };

  return (
      <header className="encabezado">

        <a href="#" >
          <img src="/logos/fondo.jpg" className="miLogo" alt="ACA VA EL LOGO" />
        </a>

        <a href="#home" className='direccionamiento'>Inicio</a>
        <Link to="/productos" className='direccionamiento'>Tienda</Link>
        <a href="#services" className='direccionamiento'>Nosotros</a>
        
        <input 
          className='buscador'
          type="text"
          placeholder='Buscar producto'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          />
        <div className='iconosUser'>
        {isLogged ? (<button onClick={handleLogout}>Cerrar sesión</button> ) : (
          <Link to="/login" className='user'>
            <img src="/logos/vectorUsuario.png" alt="ìconoUsuario"/>  
          </Link>
        )}
        <a href="#" className='carrito'><img src="/logos/carrito.png" alt="iconoCarrito"/></a>
          
        </div>
      </header>
  );
}
