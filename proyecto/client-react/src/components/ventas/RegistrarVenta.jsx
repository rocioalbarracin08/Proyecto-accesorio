import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import './registrarVenta.css';

function RegistrarVenta() {
  const { isLogged, userRole } = useAuthContext();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);  // Nuevo: productos filtrados por búsqueda
  const [metodosPago, setMetodosPago] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [venta, setVenta] = useState({
    id_cliente: null,
    id_metodo_pago: "",
    detalles: []
  });
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");  // Nuevo: búsqueda de productos
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Función auxiliar para calcular descuento (simulado; integra con backend si quieres)
  const calcularDescuento = (producto) => {
    return 0;  // Cambia a lógica real si tienes promociones
  };

  // Calcular total dinámico con descuentos aplicados
  const total = venta.detalles.reduce((sum, det) => {
    const prod = productos.find(p => p.id_producto === det.id_producto);
    if (!prod) return sum;
    const descuento = calcularDescuento(prod);
    const precioFinal = prod.precio * (1 - descuento);
    return sum + (precioFinal * det.cantidad);
  }, 0);

  useEffect(() => {
    if (!isLogged || userRole !== 'empleado') {
      window.location.href = '/login';
    } else {
      // Cargar productos con stock (inicialmente todos)
      fetch("http://localhost:5000/productos/mostrar?page=1&per_page=100", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          setProductos(data.productos || []);
          setProductosFiltrados(data.productos || []);  // Inicialmente, mostrar todos
        });
      
      // Cargar métodos de pago
      fetch("http://localhost:5000/metodos_pagos/", { credentials: "include" })
        .then(res => res.json())
        .then(data => setMetodosPago(data || []));
    }
  }, [isLogged, userRole]);

  // Búsqueda de clientes
  useEffect(() => {
    if (busquedaCliente.trim().length > 2) {
      fetch(`http://localhost:5000/clientes?busqueda=${encodeURIComponent(busquedaCliente)}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setClientes(data || []));
    } else {
      setClientes([]);
    }
  }, [busquedaCliente]);

  // Búsqueda de productos
  useEffect(() => {
    if (busquedaProducto.trim().length > 2) {
      fetch(`http://localhost:5000/productos/buscar?q=${encodeURIComponent(busquedaProducto)}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setProductosFiltrados(data.resultados || []));
    } else {
      // Si no hay búsqueda, mostrar todos los productos cargados inicialmente
      setProductosFiltrados(productos);
    }
  }, [busquedaProducto, productos]);

  const seleccionarCliente = (cliente) => {
    setVenta({ ...venta, id_cliente: cliente.id_cliente });
    setClienteEncontrado(cliente);
    setBusquedaCliente(`${cliente.name} ${cliente.apellido}`);
    setClientes([]);
  };

  const sinCliente = () => {
    setVenta({ ...venta, id_cliente: null });
    setClienteEncontrado(null);
    setBusquedaCliente("Venta sin cliente registrado");
    setClientes([]);
  };

  const agregarProducto = (id_producto, cantidad) => {
    const cant = parseInt(cantidad) || 0;
    if (cant > 0) {
      setVenta(prev => ({
        ...prev,
        detalles: [...prev.detalles.filter(d => d.id_producto !== parseInt(id_producto)), { id_producto: parseInt(id_producto), cantidad: cant }]
      }));
    } else {
      setVenta(prev => ({
        ...prev,
        detalles: prev.detalles.filter(d => d.id_producto !== parseInt(id_producto))
      }));
    }
  };

  const removerProducto = (id_producto) => {
    setVenta(prev => ({
      ...prev,
      detalles: prev.detalles.filter(d => d.id_producto !== id_producto)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (venta.detalles.length === 0) {
      setMensaje({ text: "Agrega al menos un producto.", type: 'error' });
      return;
    }
    fetch("http://localhost:5000/ventas/registrar_venta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(venta)
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.mensaje ? { text: data.mensaje, type: 'success' } : { text: data.error, type: 'error' });
        if (data.mensaje) setVenta({ id_cliente: null, id_metodo_pago: "", detalles: [] });
      });
  };

  return (
    <div className="registrar-venta-container">
      <div className="venta-content">
        <h2>Registrar Venta</h2>
        {mensaje && (
          <div className={`venta-mensaje ${mensaje.type}`}>
            {mensaje.text}
          </div>
        )}
        <form className="venta-form" onSubmit={handleSubmit}>
          <div>
            <label>Buscar Cliente (opcional):</label>
            <input
              type="text"
              value={busquedaCliente}
              onChange={e => setBusquedaCliente(e.target.value)}
              placeholder="Nombre o email del cliente"
            />
            {clientes.length > 0 && (
              <ul className="clientes-lista">
                {clientes.map(c => (
                  <li key={c.id_cliente} onClick={() => seleccionarCliente(c)}>
                    {c.name} {c.apellido} - {c.email}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-sin-cliente" onClick={sinCliente}>
              Venta sin cliente registrado
            </button>
          </div>
          <div>
            <label>Método de Pago:</label>
            <select value={venta.id_metodo_pago} onChange={e => setVenta({...venta, id_metodo_pago: e.target.value})} required>
              <option value="">Seleccionar</option>
              {metodosPago.map(mp => (
                <option key={mp.id_metodo_pago} value={mp.id_metodo_pago}>
                  {mp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="productos-seccion">
            <h3>Productos</h3>
            {/* Nuevo: Campo de búsqueda de productos */}
            <div className="busqueda-productos">
              <input
                type="text"
                value={busquedaProducto}
                onChange={e => setBusquedaProducto(e.target.value)}
                placeholder="Buscar productos..."
                className="input-busqueda"
              />
              <span className="lupa">🔍</span>
            </div>
            {productosFiltrados.map(p => {  // Cambiado a productosFiltrados
              const descuento = calcularDescuento(p);
              const precioFinal = p.precio * (1 - descuento);
              const stock = p.stock || 0;
              return (
                <div key={p.id_producto} className="product-item">
                  <div className="producto-info">
                    <span className="producto-nombre">{p.name}</span>
                    <span className="producto-precio">
                      {descuento > 0 ? (
                        <>
                          <span className="precio-original">${p.precio.toFixed(2)}</span>
                          <span className="precio-descuento">${precioFinal.toFixed(2)} ({(descuento * 100).toFixed(0)}% off)</span>
                        </>
                      ) : (
                        `$${p.precio.toFixed(2)}`
                      )}
                    </span>
                    <span className="producto-stock">Stock: {stock}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={stock}
                    placeholder="Cant."
                    onChange={e => agregarProducto(p.id_producto, e.target.value)}
                    disabled={stock === 0}
                  />
                </div>
              );
            })}
            {venta.detalles.length > 0 && (
              <div className="productos-agregados">
                <h4>Productos Agregados:</h4>
                <ul>
                  {venta.detalles.map(d => {
                    const prod = productos.find(p => p.id_producto === d.id_producto);
                    if (!prod) return null;
                    const descuento = calcularDescuento(prod);
                    const precioFinal = prod.precio * (1 - descuento);
                    return (
                      <li key={d.id_producto}>
                        {prod.name} x {d.cantidad} = ${precioFinal.toFixed(2)}
                        <button onClick={() => removerProducto(d.id_producto)}>Remover</button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <div className="venta-total">
            Total: ${total.toFixed(2)}
          </div>
          <div className="venta-buttons">
            <button type="submit" className="btn-submit">Registrar Venta</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrarVenta;