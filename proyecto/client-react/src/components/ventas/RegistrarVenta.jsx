import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import './registrarVenta.css';

function RegistrarVenta() {
  const { isLogged, userRole } = useAuthContext();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [venta, setVenta] = useState({
    id_cliente: null,
    metodo_pago: "",
    detalles: []
  });
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Calcular total dinámico
  const total = venta.detalles.reduce((sum, det) => {
    const prod = productos.find(p => p.id_producto === det.id_producto);
    return sum + (prod ? prod.precio * det.cantidad : 0);
  }, 0);

  useEffect(() => {
    if (!isLogged || userRole !== 'empleado') {
      window.location.href = '/login';
    }
  }, [isLogged, userRole]);

  useEffect(() => {
    fetch("http://localhost:5000/productos/mostrar?page=1&per_page=100")
      .then(res => res.json())
      .then(data => setProductos(data.productos || []));
  }, []);

  useEffect(() => {
    if (busquedaCliente.trim().length > 2) {
      fetch(`http://localhost:5000/clientes?busqueda=${encodeURIComponent(busquedaCliente)}`)
        .then(res => res.json())
        .then(data => setClientes(data || []));
    } else {
      setClientes([]);
    }
  }, [busquedaCliente]);

  const seleccionarCliente = (cliente) => {
    setVenta({ ...venta, id_cliente: cliente.id_cliente });
    setClienteEncontrado(cliente);
    setBusquedaCliente(`${cliente.nombre} ${cliente.apellido}`);
    setClientes([]);
  };

  const sinCliente = () => {
    setVenta({ ...venta, id_cliente: null });
    setClienteEncontrado(null);
    setBusquedaCliente("Venta sin cliente registrado");
    setClientes([]);
  };

  const agregarProducto = (id_producto, cantidad) => {
    if (cantidad > 0) {
      setVenta(prev => ({
        ...prev,
        detalles: [...prev.detalles.filter(d => d.id_producto !== parseInt(id_producto)), { id_producto: parseInt(id_producto), cantidad: parseInt(cantidad) }]
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
        if (data.mensaje) setVenta({ id_cliente: null, metodo_pago: "", detalles: [] });
      });
  };

  return (
    <div className="registrar-venta-container">
      <div className="venta-content">
        <h2>Registrar Venta (Física)</h2>
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
                    {c.nombre} {c.apellido} - {c.email}
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
            <select value={venta.metodo_pago} onChange={e => setVenta({...venta, metodo_pago: e.target.value})} required>
              <option value="">Seleccionar</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <div className="productos-seccion">
            <h3>Productos</h3>
            {productos.map(p => (
              <div key={p.id_producto} className="producto-item">
                <span>{p.name} - ${p.precio}</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Cant."
                  onChange={e => agregarProducto(p.id.id_producto, e.target.value)}
                />
              </div>
            ))}
            {venta.detalles.length > 0 && (
              <div>
                <h4>Productos Agregados:</h4>
                <ul>
                  {venta.detalles.map(d => {
                    const prod = productos.find(p => p.id_producto === d.id_producto);
                    return (
                      <li key={d.id_producto}>
                        {prod?.name} x {d.cantidad} = ${prod ? prod.precio * d.cantidad : 0}
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