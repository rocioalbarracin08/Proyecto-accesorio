import './nav.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function BarraNavegacion() {
  const [busqueda, setBusqueda] = useState('');
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
          <Link to="/login" className='user'>
            <img src="/logos/vectorUsuario.png" alt="ìconoUsuario"/>  
          </Link>
          <a href="#" className='carrito'><img src="/logos/carrito.png" alt="iconoCarrito"/></a>
        </div>
      </header>
  );
}
