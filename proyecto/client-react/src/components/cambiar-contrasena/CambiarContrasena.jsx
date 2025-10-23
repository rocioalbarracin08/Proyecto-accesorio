import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./cambiarContrasena.css";

export default function CambiarContrasena() {
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevaContrasena !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/usuarios/cambiar_contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contrasena_actual: contrasenaActual, nueva_contrasena: nuevaContrasena }),
      });
      const data = await res.json();
      if (res.ok) setMensaje(data.mensaje);
      else setError(data.error);
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cambiar-section">
      <h1>Cambiar Contraseña</h1>
      {mensaje && <p className="mensaje">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
      <form className="cambiar-form" onSubmit={handleSubmit}>
        <div className="password-container">
          <input
            type={showActual ? "text" : "password"}
            placeholder="Contraseña Actual"
            value={contrasenaActual}
            onChange={(e) => setContrasenaActual(e.target.value)}
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowActual(!showActual)}>
            {showActual ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-container">
          <input
            type={showNueva ? "text" : "password"}
            placeholder="Nueva Contraseña"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowNueva(!showNueva)}>
            {showNueva ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-container">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="btnCont" type="submit" disabled={loading}>
          {loading ? "Cambiando..." : "Confirmar Cambio"}
        </button>
        <Link to= "/perfil" className="linkVolverPerfil">Volver al perfil</Link>
      </form>
    </section>
  );
}
