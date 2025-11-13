import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";  // Íconos para mostrar/ocultar
import "./resetearContrasenaToken.css";

export default function ResetearContrasenaToken() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido. Solicita un nuevo enlace de recuperación.");
    }
  }, [token]);

  // Función para validar contraseña
  const validarPassword = (pwd) => {
    if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una letra mayúscula.";
    if (!/[a-z]/.test(pwd)) return "Debe incluir al menos una letra minúscula.";
    if (!/\d/.test(pwd)) return "Debe incluir al menos un número.";
    if (!/[!@#$%^&*]/.test(pwd)) return "Debe incluir al menos un símbolo especial (!@#$%^&*).";
    return null;  // Válida
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    // Validar contraseña
    const errorPwd = validarPassword(password);
    if (errorPwd) {
      setError(errorPwd);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Verifica e intenta de nuevo.");
      return;
    }

    if (!token) {
      setError("Enlace expirado o inválido. Solicita un nuevo enlace.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/usuarios/resetear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMensaje("¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.error || "Error al resetear contraseña. Intenta de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión. Verifica tu internet e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetear-container">
      <h1 className="resetear-title">Resetear Contraseña</h1>
      <p>Ingresa una nueva contraseña segura</p>
      {mensaje && <p className="resetear-message">{mensaje}</p>}
      {error && <p className="resetear-error">{error}</p>}
      <form onSubmit={handleSubmit} className="resetear-form">
        <div className="input-password">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="resetear-input"
          />
          <span onClick={() => setShowPassword(!showPassword)} className="span-eye">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="input-password">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="resetear-input"
          />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="span-eye">
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit" disabled={loading || !token} className="resetear-btn">
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>
        <Link to="/" className="linkInicio">I N I C I O</Link>
      </form>
    </div>
  );
}