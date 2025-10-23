import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./factura.css";

export function Factura() {
  const { state } = useCarrito();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext(); // variable que indica si el usuario está logueado
  const [email, setEmail] = useState(user?.email || "");
  const [entrega, setEntrega] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [telefono, setTelefono] = useState("");


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
            <tr key={id}>
              <td>{item.producto.nombre || item.producto.name}</td>
              <td>${item.producto.precio}</td>
              <td>{item.cantidad}</td>
              <td>${(item.cantidad * item.producto.precio).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total: ${state.totalPrice.toFixed(2)}</h3>

      {/* Solo mostrar opciones de entrega si hay items y el usuario está logueado */}
      {Object.keys(state.items).length > 0 && isAuthenticated && (
        <div className="factura-entrega-section">
          <label>
            Email para contacto:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div className="factura-entrega-buttons">
            <button
              onClick={() => handleEntregaClick("sucursal")}
              style={{
                backgroundColor: entrega === "sucursal" ? "#f0b6c1" : "#fff",
              }}
            >
              Retiro en Sucursal
            </button>
            <button
              onClick={() => handleEntregaClick("envio")}
              style={{
                backgroundColor: entrega === "envio" ? "#f0b6c1" : "#fff",
              }}
            >
              Envío a domicilio
            </button>
          </div>
        </div>
      )}

      {/* Botón finalizar */}
      <button className="btn-finalizar" onClick={handleFinalizar}>
        Finalizar Compra
      </button>

      {!isAuthenticated && (
        <p style={{ color: "red" }}>
          Debes iniciar sesión para seleccionar el método de entrega.
        </p>
      )}
    </div>
  );
}