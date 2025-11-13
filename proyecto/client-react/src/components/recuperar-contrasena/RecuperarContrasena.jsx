import { useState } from "react";
import { Link } from "react-router-dom";
import "./recuperarContrasena.css";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");  // Para almacenar la URL del backend

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setResetUrl("");

    // Validación básica adicional (opcional, ya que tienes required)
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un email válido.");
      return;
    }
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
        setResetUrl(data.reset_url);  // Recibe la URL del backend
      } else {
        setError(data.error || "Error al solicitar recuperación.");
      }
    } catch (err) {
      setError("Error de conexión. Verifica tu internet e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-container">
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
          {loading ? "Enviando..." : "Enviar email"}
        </button>
      </form>
      <Link to="/login" className="recuperar-link">Volver a Login</Link>
      {/* Botón animado que aparece si hay resetUrl */}
      {resetUrl && (
        <a href={resetUrl} className="reset-link-btn">
          Ir a resetear contraseña
        </a>
      )}
    </div>
  );
}