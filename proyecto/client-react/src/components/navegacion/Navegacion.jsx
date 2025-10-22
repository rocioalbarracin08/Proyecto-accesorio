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
  const { state, toggleCarrito, closeCarrito } = useCarrito();

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
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => handleBuscar(busqueda), 300);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleBuscar(busqueda);
  };

  return (
    <>
      <header className="encabezado">
        <Link to="/">
          <img src="/logo.png" className="miLogo" alt="Logo de la tienda" />
        </Link>

        <Link to="/" className='direccionamiento'>Inicio</Link> 
        <Link to="/productos" className='direccionamiento'>Tienda</Link>
        <Link to="/nosotros" className='direccionamiento'>Nosotros</Link>  

        <form onSubmit={handleSubmit} className="buscador-form">  {/* Agregué clase para el form */}
          <input
            className="buscador"
            type="text"
            placeholder="Buscar producto o categoría"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          
          {resultados.length > 0 && (
            <ul className="buscador-dropdown">  {/* Clase CSS en lugar de style */}
              {resultados.map((prod) => (
                <li key={prod.id_producto} className="buscador-item">  {/* Clase CSS */}
                  <Link
                    to={`/productos/${prod.id_categoria}`}
                    onClick={() => {
                      setBusqueda("");
                      setResultados([]);
                    }}
                    className="buscador-link" >
                    <img 
                      src={prod.imagen_url || "/default.jpg"} 
                      alt={prod.name} 
                      className="buscador-img"
                    />
                    <div>
                      <strong>{prod.categoria}</strong>: {prod.name} - ${prod.precio}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {loading && <p className="buscador-loading">Buscando...</p>}  {/* Clase CSS */}
        </form>

        <div className="iconosUser">
          {isLogged ? (
            <>
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