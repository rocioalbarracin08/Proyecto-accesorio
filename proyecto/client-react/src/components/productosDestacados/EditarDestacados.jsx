import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import './editarDestacados.css';  // Crea este CSS (ver abajo)

function EditarDestacados() {
  const { isLogged, isOwner } = useAuthContext();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!isLogged || !isOwner) {
      console.log(isLogged)
    } else {
      // Cargar productos con destacado y stock
      fetch("http://localhost:5000/productos/destacados/editar", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          setProductos(data.productos || []);
          setProductosFiltrados(data.productos || []);
        })
        .catch(err => setMensaje({ text: "Error cargando productos", type: 'error' }));
    }
  }, [isLogged, isOwner]);

  // Búsqueda de productos
  useEffect(() => {
    if (busquedaProducto.trim().length > 2) {
      const filtrados = productos.filter(p =>
        p.name.toLowerCase().includes(busquedaProducto.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    } else {
      setProductosFiltrados(productos);
    }
  }, [busquedaProducto, productos]);

  const toggleDestacado = (id_producto) => {
    setProductos(prev => prev.map(p =>
      p.id_producto === id_producto ? { ...p, destacado: !p.destacado } : p
    ));
  };

  const handleGuardar = () => {
    const productosActualizados = productos.map(p => ({
      id_producto: p.id_producto,
      destacado: p.destacado ? 1 : 0
    }));
    
    fetch("http://localhost:5000/productos/destacados/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productos: productosActualizados })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.mensaje ? { text: data.mensaje, type: 'success' } : { text: data.error, type: 'error' });
      })
      .catch(err => setMensaje({ text: "Error guardando cambios", type: 'error' }));
  };

  return (
    <div className="editar-destacados-container">
      <h2>Editar Productos Destacados</h2>
      {mensaje && (
        <div className={`mensaje ${mensaje.type}`}>
          {mensaje.text}
        </div>
      )}
      
      <div className="busqueda-seccion">
        <input
          type="text"
          value={busquedaProducto}
          onChange={e => setBusquedaProducto(e.target.value)}
          placeholder="Buscar productos..."
          className="input-busqueda"
        />
        <span className="lupa">🔍</span>
      </div>
      
      <div className="productos-lista">
        {productosFiltrados.map(p => (
          <div key={p.id_producto} className="producto-item">
            <img src={p.imagen_url} alt={p.name} className="producto-img" />
            <div className="producto-info">
              <span className="producto-nombre">{p.name}</span>
              <span className="producto-precio">${p.precio.toFixed(2)}</span>
              <span className="producto-stock">Stock: {p.stock || 0}</span>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={p.destacado || false}
                onChange={() => toggleDestacado(p.id_producto)}
              />
              Destacado
            </label>
          </div>
        ))}
      </div>
      
      <button onClick={handleGuardar} className="btn-guardar">Guardar Cambios</button>
    </div>
  );
}

export default EditarDestacados;