import { useState } from "react";
import { Link } from "react-router-dom";
import "./recuperarContrasena.css";  // Importa el CSS

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/usuarios/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("Email enviado. Revisa tu bandeja de entrada.");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-container">  {/* Clase CSS en lugar de style */}
      <h1 className="recuperar-title">Recuperar Contraseña</h1>
      <p>Ingresa tu email para recibir un enlace de recuperación</p>
      {mensaje && <p className="recuperar-message">{mensaje}</p>}
      {error && <p className="recuperar-error">{error}</p>}
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