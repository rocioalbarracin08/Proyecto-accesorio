import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./resetearContrasena.css";

export default function CambiarContrasena() {
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/usuarios/cambiar_contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contrasena_actual: contrasenaActual,
          nueva_contrasena: password,
        }),
        credentials: "include",  // Aseguramos que la cookie JWT se envíe con la solicitud
      });
      const data = await res.json();

      if (res.ok) {
        setMensaje("Contraseña cambiada exitosamente.");
        // Borrar la cookie del token
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; //la cookie que contiene el token JWT se elimina
        
        // Redirigir al login
        setTimeout(() => navigate("/login"), 2000);  // Redirige después de 2 segundos
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
    <div className="resetear-container">
      <h1 className="resetear-title">Cambiar Contraseña</h1>
      {mensaje && <p className="resetear-message">{mensaje}</p>}
      {error && <p className="resetear-error">{error}</p>}
      <form onSubmit={handleSubmit} className="resetear-form">
        <input
          type="password"
          placeholder="Contraseña Actual"
          value={contrasenaActual}
          onChange={(e) => setContrasenaActual(e.target.value)}
          required
          className="resetear-input"
        />
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
          {loading ? "Cambiando..." : "Confirmar Cambio"}
        </button>
      </form>
      <Link to="/perfil">Volver al perfil</Link>
    </div>
  );
}
