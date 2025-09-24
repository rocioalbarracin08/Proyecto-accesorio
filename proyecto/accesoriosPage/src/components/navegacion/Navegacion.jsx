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

      <main>
        <h1></h1>
        <input type="text" placeholder="Usuario" />
        <input type="password" placeholder="Contraseña" />
        <button>Login</button>
        <a className="link" href="#">¿Perdiste tu contraseña?</a><br />
        <a href="#">¿No tienes cuenta? Regístrate</a><br />
        <a href="#">Volver</a>
      </main>

      <div class="search-container">
       <input type="text" placeholder="Buscar..." class="search-input"/>
       <button class="search-btn">
       🔍
       </button>
      </div>
    </div>
  );
}
