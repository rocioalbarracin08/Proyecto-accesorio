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
            <li><a href="#about">Acerca de</a></li>
            <li><a href="#services">Servicios</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </nav>
        <div className="cta">
          <a href="#cta" className="btn">¡Contáctanos!</a>
        </div>
      </header>

      <main>
        <h1></h1>
        <input type="text" placeholder="Usuario" />
        <input type="password" placeholder="Contraseña" />
        <button>Login</button>
        <a className="link" href="#">¿Perdiste tu contraseña?</a><br />
        <a href="#">¿No tienes cuenta? Regístrate</a><br />
        <a href="#">Volver</a>
      </main>
    </div>
  );
}
