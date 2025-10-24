import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";  // useSearchParams para leer el token de la URL
import { Link } from "react-router-dom";
import "./resetearContrasenaToken.css";  // Crea un CSS similar al tuyo

export default function ResetearContrasenaToken() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();  // Para obtener el token de la URL

  const token = searchParams.get("token");  // Lee el token de la query string

  useEffect(() => {
    if (!token) {
      setError("Token no proporcionado o inválido.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setError("Token inválido.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/usuarios/resetear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),  // Envía token y nueva contraseña
      });
      const data = await res.json();

      if (res.ok) {
        setMensaje("Contraseña reseteada exitosamente. Redirigiendo al login...");
        setTimeout(() => navigate("/login"), 2000);
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
      <h1 className="resetear-title">Resetear Contraseña</h1>
      <p>Ingresa tu nueva contraseña</p>
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
        <button type="submit" disabled={loading || !token} className="resetear-btn">
          {loading ? "Reseteando..." : "Resetear Contraseña"}
        </button>
        <Link to="/" className="linkInicio">I N I C I O</Link>
      </form>
    </div>
  );
}