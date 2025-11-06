import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useCarrito } from "../../contexts/CarritoContext";
import { ComprasCarrito } from "../carrito/ComprasCarrito";
import { FaSearch } from "react-icons/fa";  // Importar ícono de búsqueda de React Icons
import "./nav.css";

export function BarraNavegacion() {
  const { isLogged, logout } = useAuthContext();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { state, toggleCarrito, closeCarrito } = useCarrito();
  const [perfil, setPerfil] = useState({}); 

  const [categorias, setCategorias] = useState([]);

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

  // NUEVO: Fetch categorías al montar
  useEffect(() => {
    fetch("http://localhost:5000/categoria/")
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error("Error obteniendo categorías:", err));
  }, []);

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
    <header className={`encabezado ${isSearchOpen ? 'search-active' : ''} ${isLogged ? 'logged-in' : 'not-logged-in'}`}>
      {/* Logo: ocupa 2 filas a la izquierda */}
      <Link to="/" className="logo-link">
        <img src="/logo.png" className="miLogo" alt="Logo de la tienda" />
      </Link>

      {/* Centro fila 1: buscador, saludo, perfil */}
      <div className="header-center">
        <div className="buscador-container">  {/* Solo un contenedor */}
          <div className={`buscador-wrapper ${isSearchOpen ? 'open' : ''}`}>
            <FaSearch color="#a05252" size={20} onClick={() => setIsSearchOpen(true)}
              className="buscador-icono"
              aria-label="Abrir búsqueda"/>
            <input
              className="buscador"
              type="text"
              placeholder="Buscar producto o categoría"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus={isSearchOpen}
            />
            {isSearchOpen && (
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
            )}
          </div>
          {isSearchOpen && resultados.length > 0 && (
            <ul className="buscador-dropdown">
              {resultados.map((prod) => (
                <li key={prod.id_producto} className="buscador-item">
                  <Link
                    to={`/producto/${prod.id_producto}`}
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
          {isSearchOpen && loading && <p className="buscador-loading">Buscando...</p>}
        </div>
        <div className="user-section">
          {isLogged ? (
            <>
              <div className="saludo-usuario">
                <span className="saludo-texto">Hola, {perfil.nombre || "Usuario"}!</span>
              </div>
              <Link to="/perfil">
                <img src="/logos/vectorUsuario.png" alt="Perfil" className="perfil" />
              </Link>
            </>
          ) : (
            <Link to="/login" className="user">
              <img src="/logos/vectorUsuario.png" alt="Iniciar sesión" />
            </Link>
          )}
        </div>
      </div>

      {/* Derecha fila 1: carrito y cerrar sesión */}
      <div className="header-right">
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
        {isLogged && (
          <button onClick={handleLogout} className="btn-cerrarSesion">
            Cerrar sesión
          </button>
        )}
      </div>

      {/* Fila 2: links centrados */}
      <nav className="nav-links">
        <Link to="/" className='direccionamiento'>Inicio</Link>

        <div className="tienda-submenu-container">
          <Link to="/productos" className='direccionamiento tienda-link'>Tienda</Link>
          <div className="tienda-submenu">
            {categorias.map(cat => (
              <button
                key={cat.id_category}
                className="submenu-item"
                onClick={() => navigate(`/productos/${cat.id_category}`)}
              >
                {cat.categoria}
              </button>
            ))}
          </div>
        </div>

        <div className="nosotros-submenu-container">
          <Link to="/nosotros" className='direccionamiento nosotros-link'>+ INFO</Link>
          <div className="nosotros-submenu">
            <Link to="/nosotros" className="submenu-item">Nosotros</Link>
            <Link to="/nosotros/preguntas" className="submenu-item">Preguntas de clientes</Link>
          </div>
        </div>
      </nav>
    </header>

    {state.showCarrito && <ComprasCarrito />}
  </>
);}
