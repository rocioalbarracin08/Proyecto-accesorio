import { ProductoGrid } from '../producto/Producto';
import './nav.css';

export function BarraNavegacion() {
  return (
    <div className="background-image">
      <header className="header">
        <div className="logo">
          <a href="#">MiLogo</a>
        </div>
        <nav className="navigation">
          <ul>
            <li><a href="#home">Inicio</a></li>
            <li><a href="#about">Info</a></li>
            <li><a href="#services">Productos</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </nav>
        <div className="cta">
          <a href="#cta" className="btn">Iniciar sesion</a>
        </div>
      </header>

      <ProductoGrid/>
    </div>
  );
}
