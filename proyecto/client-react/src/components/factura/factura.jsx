import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./factura.css";

export function Factura() {
  const { state } = useCarrito();
  const { user } = useAuthContext(); // Obtener user del contexto
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para autenticación
  const [entrega, setEntrega] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [telefono, setTelefono] = useState("");

  // Actualizar isAuthenticated basado en user
  useEffect(() => {
    console.log("User from context:", user); // <-- AGREGADO: Muestra el valor de user (null, objeto, etc.)
    setIsAuthenticated(!!user); // true si user existe, false si no
    console.log("isAuthenticated set to:", !!user); // <-- AGREGADO: Confirma si isAuthenticated es true o false
  }, [user]);

  // Actualizar email cuando user cambie
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleEntregaClick = (opcion) => setEntrega(opcion);

  const handleFinalizar = () => {
    if (!user) {
      alert("Debes iniciar sesión para finalizar la compra.");
      navigate("/login");
      return;
    }
    if (!email) {
      alert("Por favor ingrese su correo electrónico.");
      return;
    }
    if (!entrega) {
      alert("Por favor seleccione un método de entrega.");
      return;
    }
    if (!nombre || !apellido) {
      alert("Por favor complete nombre y apellido.");
      return;
    }
    if (entrega === "envio" && (!direccion || !ciudad || !provincia || !codigoPostal)) {
      alert("Por favor complete todos los campos de dirección para envío a domicilio.");
      return;
    }
    if (!telefono) {
      alert("Por favor ingrese su teléfono.");
      return;
    }
    
    alert(`Pedido enviado a ${email} con entrega: ${entrega}`);
  };

  return (
    <div className="factura-page">
      <h2>Factura de Compra</h2>
      
      {/* Contenedor principal con layout lateral */}
      <div className="factura-container">
        {/* Columna izquierda: Tabla de la factura */}
        <div className="factura-table">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(state.items).map(([id, item]) => (
                <tr key={item.producto.id || id}>
                  <td>{item.producto.nombre || item.producto.name}</td>
                  <td>${item.producto.precio}</td>
                  <td>{item.cantidad}</td>
                  <td>${(item.cantidad * item.producto.precio).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Total: ${state.totalPrice.toFixed(2)}</h3>
        </div>

        {/* Columna derecha: Opciones de entrega o mensaje */}
        <div className="factura-options">
          {isAuthenticated ? (
            <div className="factura-form">
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label>
                Nombre:
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>

              <label>
                Apellido:
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </label>

              <label>
                Teléfono:
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </label>

              <div className="factura-entrega-buttons">
                <button
                  type="button"
                  onClick={() => handleEntregaClick("sucursal")}
                  style={{
                    backgroundColor: entrega === "sucursal" ? "#f0b6c1" : "#fff",
                  }}
                >
                  Retiro en Sucursal
                </button>
                <button
                  type="button"
                  onClick={() => handleEntregaClick("envio")}
                  style={{
                    backgroundColor: entrega === "envio" ? "#f0b6c1" : "#fff",
                  }}
                >
                  Envío a domicilio
                </button>
              </div>

              {/* Campos adicionales si selecciona envío */}
              {entrega === "envio" && (
                <div className="direccion-section">
                  <label>
                    Dirección:
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                    />
                  </label>
                  <label>
                    Ciudad:
                    <input
                      type="text"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                    />
                  </label>
                  <label>
                    Provincia:
                    <input
                      type="text"
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                    />
                  </label>
                  <label>
                    Código Postal:
                    <input
                      type="text"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                    />
                  </label>
                </div>
              )}

              <button className="btn-finalizar" onClick={handleFinalizar}>
                Finalizar Compra
              </button>
            </div>
          ) : (
            // Si no está autenticado, mostrar el mensaje rojo
            <p style={{ color: "red" }}>
              Debes iniciar sesión para seleccionar el método de entrega.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}