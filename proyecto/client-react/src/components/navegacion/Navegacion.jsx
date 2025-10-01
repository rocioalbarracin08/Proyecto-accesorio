import './nav.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function BarraNavegacion() {
  const [busqueda, setBusqueda] = useState('');
  return (
      <header className="encabezado">

        <a href="#" className="miLogo">MiLogo</a>

        <ul className="listaLinks">
            <li><a href="#home">Inicio</a></li>
            <li><a href="#tienda">Tienda</a></li>
            <li><a href="#services">Nosotros</a></li>
        </ul>
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
