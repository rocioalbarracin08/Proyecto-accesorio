import './nav.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

export function BarraNavegacion() {
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include" // envía la cookie automáticamente
    })
    .then(res => {
      if (res.ok) setIsLogged(true);
      else setIsLogged(false);
    });
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include"
    });
    setIsLogged(false); //Ya no hay logueo
    navigate("/login"); // redirige al login después de cerrar sesión
  };

  return (
      <header className="encabezado">

        <a href="#" >
          <img src="/logos/fondo.jpg" className="miLogo" alt="ACA VA EL LOGO" />
        </a>

        <a href="#home" className='direccionamiento'>Inicio</a>
        <a href="#tienda" className='direccionamiento'>Tienda</a>
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
