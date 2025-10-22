// src/components/recuperarContrasena.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "./recuperarContrasena.css";  // Importa el CSS

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");  // Estado para almacenar el email ingresado
  const [mensaje, setMensaje] = useState("");  // Estado para mensajes de éxito
  const [error, setError] = useState("");  // Estado para mensajes de error
  const [loading, setLoading] = useState(false);  // Estado para controlar la carga

  const handleSubmit = async (e) => {
    e.preventDefault();  // Evita la recarga de la página
    setError("");  // Resetea el error
    setMensaje("");  // Resetea el mensaje
    setLoading(true);  // Activa el estado de carga

    try {
      const res = await fetch("http://localhost:5000/usuarios/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),  // Envía el email como JSON
      });
      const data = await res.json();  // Convierte la respuesta a JSON
      if (res.ok) {
        setMensaje("Email enviado. Revisa tu bandeja de entrada.");  // Mensaje de éxito
      } else {
        setError(data.error);  // Muestra el error si ocurre
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");  // Maneja errores de conexión
    } finally {
      setLoading(false);  // Desactiva el estado de carga
    }
  };

  return (
    <div className="recuperar-container"> 
      <h1 className="recuperar-title">Recuperar Contraseña</h1>
      <p>Ingresa tu email para recibir un enlace de recuperación</p>
      {mensaje && <p className="recuperar-message">{mensaje}</p>}  {/* Mensaje de éxito */}
      {error && <p className="recuperar-error">{error}</p>}  {/* Mensaje de error */}
      <form onSubmit={handleSubmit} className="recuperar-form"> 
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required
          className="recuperar-input"
        />
        <button type="submit" disabled={loading} className="recuperar-btn"> 
          {loading ? "Enviando..." : "Enviar Email"} 
        </button>
      </form>
      <Link to="/login" className="recuperar-link">Volver a Login</Link> 
    </div>
  );
}
