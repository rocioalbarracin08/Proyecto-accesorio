import "./nav.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useCarrito } from "../../contexts/CarritoContext";
import { ComprasCarrito } from "../carrito/ComprasCarrito";

export function BarraNavegacion() {
  const { isLogged, logout } = useAuthContext();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { state, toggleCarrito, closeCarrito } = useCarrito();
  const [perfil, setPerfil] = useState({}); 

  // Obtener perfil al loguearse
  useEffect(() => {
    if (isLogged) {
      fetch("http://localhost:5000/usuarios/perfil", { credentials: "include" })
        .then(res => res.json())
        .then(data => setPerfil(data))
        .catch(err => console.error("Error obteniendo perfil:", err));
    } else {
      setPerfil({});  // Limpiar si no esta logueado
    }
  }, [isLogged]);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    });
    logout();
    navigate("/login");
  };

  const handleBuscar = async (query) => {
    if (!query.trim() || query.length < 2) {
      setResultados([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/productos/buscar?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResultados(data.resultados || []);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      setResultados(["ERROR DE BÚSQUEDA"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSearchOpen && busqueda) {
      const timeout = setTimeout(() => handleBuscar(busqueda), 300);
      return () => clearTimeout(timeout);
    } else {
      setResultados([]);
    }
  }, [busqueda, isSearchOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleBuscar(busqueda);
  };

  const handleMouseEnter = () => {
    setIsSearchOpen(true);
  };

  const handleMouseLeave = () => {
    setIsSearchOpen(false);
    setBusqueda("");
    setResultados([]);
  };

  return (
    <>
      <header className={`encabezado ${isSearchOpen ? 'search-active' : ''}`}>
        <Link to="/">
          <img src="/logo.png" className="miLogo" alt="Logo de la tienda" />
        </Link>

        <Link to="/" className='direccionamiento'>Inicio</Link> 
        <Link to="/productos" className='direccionamiento'>Tienda</Link>
        <Link to="/nosotros" className='direccionamiento'>Nosotros</Link>  

        {/* Contenedor del buscador desplegable */}
        <div className="buscador-container">
          {!isSearchOpen ? (
            <button
              className="buscador-icono"
              aria-label="Abrir búsqueda"
              onClick={() => setIsSearchOpen(true)}
            >
              <img src="/logos/lupa.png" alt="Buscar" />
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="buscador-form">
              <div className="buscador-header">
                <input
                  className="buscador"
                  type="text"
                  placeholder="Buscar producto o categoría"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="buscador-cerrar"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setBusqueda("");
                    setResultados([]);
                  }}
                >
                  ✕
                </button>
              </div>

              {resultados.length > 0 && (
                <ul className="buscador-dropdown">
                  {resultados.map((prod) => (
                    <li key={prod.id_producto} className="buscador-item">
                      <Link
                        to={`/productos/${prod.id_categoria}`}
                        onClick={() => {
                          setBusqueda("");
                          setResultados([]);
                          setIsSearchOpen(false);
                        }}
                        className="buscador-link"
                      >
                        <img
                          src={prod.imagen_url || "/default.jpg"}
                          alt={prod.name}
                          className="buscador-img"
                        />
                        <div>
                          <strong>CATEGORIA: {prod.categoria}</strong>: {prod.name}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {loading && <p className="buscador-loading">Buscando...</p>}
            </form>
          )}
        </div>

        <div className="iconosUser">
          {isLogged ? (
            <>
              {/* Saludo personalizado */}
              <div className="saludo-usuario">
                <span className="saludo-texto">Hola, {perfil.nombre || "Usuario"}!</span>
              </div>
              <Link to="/perfil">
                <img src="/logos/vectorUsuario.png" alt="Perfil" className="perfil" />
              </Link>
              <button onClick={handleLogout} className="btn-cerrarSesion">
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="user">
              <img src="/logos/vectorUsuario.png" alt="Iniciar sesión" />
            </Link>
          )}
          <button
            onClick={toggleCarrito}
            className="carrito"
            aria-label={`Ver carrito (${state.totalItems} items)`}
          >
            <img src="/logos/carrito.png" alt="Ícono de carrito de compras" />
            {state.totalItems > 0 && (
              <span className="carrito-count" aria-hidden="true">
                {state.totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {state.showCarrito && <ComprasCarrito />}
    </>
  );
}