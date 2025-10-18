import { useState } from "react";
import { Link } from "react-router-dom";

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
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Recuperar Contraseña</h1>
      <p>Ingresa tu email para recibir un enlace de recuperación</p>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: "300px", margin: "0 auto" }}>
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Enviando..." : "Enviar Email"}
        </button>
      </form>
      <Link to="/login" style={{ display: "block", marginTop: "20px" }}>Volver a Login</Link>
    </div>
  );
}