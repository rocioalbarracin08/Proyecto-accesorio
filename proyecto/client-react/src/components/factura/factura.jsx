import { useCarrito } from "../../context/CarritoContext";
import { useAuthContext } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./factura.css";

export function Factura() {
  const { state } = useCarrito();
  const { user } = useAuthContext(); // Usuario logueado
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext(); // variable que indica si el usuario está logueado

  const [email, setEmail] = useState(user?.email || "");
  const [entrega, setEntrega] = useState("");

  // Maneja la selección del método de entrega
  const handleEntregaClick = (opcion) => setEntrega(opcion);

  // Finalizar compra
  const handleFinalizar = () => {
    if (!user) {
      // Si no está logueado, redirigir al login
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

    // Aquí podrías llamar a tu backend para procesar la compra
    alert(`Pedido enviado a ${email} con entrega: ${entrega}`);
  };

  return (
    <div className="factura-page">
      <h2>Factura de Compra</h2>

      {/* Tabla con productos */}
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

      {Object.keys(state.items).length > 0 && isAuthenticated && (
  <div className="factura-entrega-section">
    <label>
      Email para contacto:
      <input type="email" placeholder="Ingrese su correo" />
    </label>
    <div className="factura-entrega-buttons">
      <button>Retiro en sucursal</button>
      <button>Envío a domicilio</button>
    </div>
    <button className="btn-finalizar">Finalizar Compra</button>
  </div>
)}


      {/* Si está logueado, mostrar correo y botones de entrega */}
      {user && (
        <div className="factura-entrega-section" style={{ marginTop: "20px" }}>
          <label>
            Correo electrónico:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>

          <div
            className="factura-entrega-buttons"
            style={{ marginTop: "10px" }}
          >
            <p>Seleccione método de entrega:</p>
            <button
              onClick={() => handleEntregaClick("sucursal")}
              style={{
                marginRight: "10px",
                backgroundColor: entrega === "sucursal" ? "#f0b6c1" : "#fff",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Retiro en Sucursal
            </button>
            <button
              onClick={() => handleEntregaClick("envio")}
              style={{
                backgroundColor: entrega === "envio" ? "#f0b6c1" : "#fff",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Envío a domicilio
            </button>
          </div>
        </div>
      )}

      {/* Botón de Finalizar Compra siempre visible */}
      <button
        className="btn-finalizar"
        onClick={handleFinalizar}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
          backgroundColor: "#c77d7d",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Finalizar Compra
      </button>

      {/* Si no está logueado, mostrar mensaje */}
      {!user && (
        <p style={{ marginTop: "10px", color: "red" }}>
          Debes iniciar sesión para seleccionar el método de entrega.
        </p>
      )}
    </div>
  );
}
