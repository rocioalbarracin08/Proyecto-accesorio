import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import './editarDestacados.css';

function EditarDestacados() {
  const { isLogged, isOwner } = useAuthContext();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]); // Todos los productos
  const [productosTopVentas, setProductosTopVentas] = useState([]); // Top Ventas
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos"); // "todos" | "top" | "destacados"

  // Cargar productos normales
  useEffect(() => {
    if (isLogged && isOwner) {
      fetch("http://localhost:5000/productos/destacados/editar", { credentials: "include" })
        .then(res => res.json())
        .then(data => setProductos(data.productos || []))
        .catch(() => setMensaje({ text: "Error cargando productos", type: 'error' }));
    }
  }, [isLogged, isOwner]);

  // Cargar Top Ventas
  useEffect(() => {
    if (isLogged && isOwner) {
      fetch("http://localhost:5000/productos/top-ventas-semana", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          const topVentas = (data.productos || []).filter(p => p.total_ventas > 0);
          setProductosTopVentas(topVentas);
        })
        .catch(err => console.error("Error cargando top ventas:", err));
    }
  }, [isLogged, isOwner]);

  // Toggle destacado
  const toggleDestacado = (id_producto) => {
    setProductos(prev => prev.map(p =>
      p.id_producto === id_producto ? { ...p, destacado: !p.destacado } : p
    ));
    setProductosTopVentas(prev => prev.map(p =>
      p.id_producto === id_producto ? { ...p, destacado: !p.destacado } : p
    ));
  };

  // Guardar cambios
  const handleGuardar = () => {
    const productosParaGuardar = [...productos, ...productosTopVentas]
      .map(p => ({ id_producto: p.id_producto, destacado: p.destacado ? 1 : 0 }));

    fetch("http://localhost:5000/productos/destacados/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productos: productosParaGuardar })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.mensaje ? { text: data.mensaje, type: 'success' } : { text: data.error, type: 'error' });
      })
      .catch(() => setMensaje({ text: "Error guardando cambios", type: 'error' }));
  };

  // Función de búsqueda usando tu endpoint
  const handleBuscar = (q) => {
    if (!q || q.length < 2) return;

    fetch(`http://localhost:5000/productos/buscar?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setProductos(data.resultados || []))
      .catch(() => setMensaje({ text: "Error buscando productos", type: 'error' }));
  };

  // Filtrar productos según botón activo
  const productosFiltrados = () => {
    if (filtroActivo === "top") {
      return productosTopVentas.filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase()));
    } else if (filtroActivo === "destacados") {
      return productos.filter(p => p.destacado === 1 && p.name.toLowerCase().includes(busqueda.toLowerCase()));
    }
    return productos.filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase()));
  };

  return (
    <div className="editar-destacados-container">
      <h2>Editar productos destacados</h2>
      {mensaje && <div className={`mensaje ${mensaje.type}`}>{mensaje.text}</div>}

      {/* Botones de filtro */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filtroActivo === "todos" ? "active" : ""}`}
          onClick={() => setFiltroActivo("todos")}
        >
          Todos los productos
        </button>
        <button
          className={`filter-btn ${filtroActivo === "top" ? "active" : ""}`}
          onClick={() => setFiltroActivo("top")}
        >
          ⭐ Top ventas
        </button>
        <button
          className={`filter-btn ${filtroActivo === "destacados" ? "active" : ""}`}
          onClick={() => setFiltroActivo("destacados")}
        >
          🌟 Destacados
        </button>
      </div>

      {/* Buscador */}
      <div className="busqueda-seccion">
        <input
          type="text"
          value={busqueda}
          onChange={e => {
            setBusqueda(e.target.value);
            handleBuscar(e.target.value);
          }}
          placeholder="Buscar producto..."
          className="input-busqueda"
        />
        <span className="lupa">🔍</span>
      </div>

      {/* Lista de productos según filtro */}
      <div className="productos-lista">
        {productosFiltrados().length > 0 ? (
          productosFiltrados().map(p => (
            <div key={p.id_producto} className={`producto-item ${filtroActivo === "top" ? "top-ventas-item" : ""}`}>
              <img src={p.imagen_url} alt={p.name} className="producto-img" />
              <div className="producto-infoDes">
                <span className="producto-nombre">{p.name}</span>
                <span className="producto-precio">${p.precio.toFixed(2)}</span>
                <span className="producto-stock">Stock: {p.stock || 0}</span>
                {p.total_ventas !== undefined && <span className="producto-ventas">📊 Ventas: {p.total_ventas}</span>}
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={p.destacado || false} onChange={() => toggleDestacado(p.id_producto)} />
                Destacado
              </label>
            </div>
          ))
        ) : (
          <p>No hay productos para mostrar</p>
        )}
      </div>

      <button onClick={handleGuardar} className="btn-guardarD">Guardar cambios</button>
      <button onClick={() => navigate(-1)} className="btn-volver">Volver atrás</button>
    </div>
  );
}

export default EditarDestacados;
