import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

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
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Resetear Contraseña</h1>
      <p>Ingresa tu nueva contraseña.</p>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: "300px", margin: "0 auto" }}>
        <input
          type="password"
          placeholder="Nueva Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Confirmar Nueva Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Reseteando..." : "Resetear Contraseña"}
        </button>
      </form>
      <Link to="/login" style={{ display: "block", marginTop: "20px" }}>Volver a Login</Link>
    </div>
  );
}