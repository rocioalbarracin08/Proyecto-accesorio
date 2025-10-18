import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./resetearContrasena.css";  // Importa el CSS

export default function ResetearContrasena() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) setError("Enlace inválido. Solicita un nuevo email de recuperación.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/usuarios/resetear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("Contraseña reseteada exitosamente. Inicia sesión.");
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
    <div className="resetear-container">  {/* Clase CSS en lugar de style */}
      <h1 className="resetear-title">Resetear Contraseña</h1>
      <p>Ingresa tu nueva contraseña.</p>
      {mensaje && <p className="resetear-message">{mensaje}</p>}
      {error && <p className="resetear-error">{error}</p>}
      <form onSubmit={handleSubmit} className="resetear-form">
        <input
          type="password"
          placeholder="Nueva Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="resetear-input"
        />
        <input
          type="password"
          placeholder="Confirmar Nueva Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="resetear-input"
        />
        <button type="submit" disabled={loading} className="resetear-btn">
          {loading ? "Reseteando..." : "Resetear Contraseña"}
        </button>
      </form>
      <Link to="/login" className="resetear-link">Volver a Login</Link>
    </div>
  );
}