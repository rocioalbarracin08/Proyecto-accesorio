import useAuth from "../../hooks/useAuth";
import "./register.css";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";  // Ícono para errores
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function Registrarse() {
  const navigate = useNavigate();

  const {
    usuarioName,
    setUsuarioName,
    repetirContraseña,
    setRepetirContraseña,
    contraseña,
    setContraseña,
    error,
    setError,
    usuarioApellido,
    setUsuarioApellido,
    email,
    setEmail,
  } = useAuth();

  const [genero, setGenero] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Función para validar email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Función para validar contraseña
  const validarPassword = (pwd) => {
    if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una letra mayúscula.";
    if (!/[a-z]/.test(pwd)) return "Debe incluir al menos una letra minúscula.";
    if (!/\d/.test(pwd)) return "Debe incluir al menos un número.";
    if (!/[!@#$%^&*]/.test(pwd)) return "Debe incluir al menos un símbolo especial (!@#$%^&*).";
    return null;
  };

  // Calcular fortaleza de contraseña
  const calcularFortaleza = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;
    if (score <= 2) return "Débil";
    if (score <= 4) return "Media";
    return "Fuerte";
  };

  const handleClick = async (event) => {
    event.preventDefault();
    setError("");

    // Validaciones (antes de cambiar el estado de loading)
    if (!usuarioName.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!usuarioApellido.trim()) {
      setError("El apellido es obligatorio.");
      return;
    }
    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }
    if (!validarEmail(email)) {
      setError("Ingresa un email válido (ej: usuario@dominio.com).");
      return;
    }
    if (!contraseña.trim()) {
      setError("La contraseña es obligatoria.");
      return;
    }
    const errorPwd = validarPassword(contraseña);
    if (errorPwd) {
      setError(errorPwd);
      return;
    }
    if (!repetirContraseña.trim()) {
      setError("Debes confirmar la contraseña.");
      return;
    }
    if (contraseña !== repetirContraseña) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!genero) {
      setError("Selecciona o escribe tu género.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: usuarioName,
          apellido: usuarioApellido,
          email,
          password: contraseña,
          genero,
        }),
      });
      if (response.ok) {
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.error || "Error en el registro. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputUsuario = (event) => {
    setUsuarioName(event.target.value);
  };

  const fortaleza = calcularFortaleza(contraseña);

  return (
    <>
      <section className="section-register">
        <h1 className="h1-register">Registrarse</h1>
        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        <form className="formularioRegister">
          <input
            type="text"
            placeholder="Nombre"
            onChange={handleInputUsuario}
            value={usuarioName}
          />
          <input
            type="text"
            placeholder="Apellido"
            onChange={(e) => setUsuarioApellido(e.target.value)}
            value={usuarioApellido}
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
          <div className="input-password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Cree una contraseña"
              onChange={(event) => setContraseña(event.target.value)}
              value={contraseña}
            />
            <span onClick={() => setShowPassword((prev) => !prev)} className="span-eye">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {contraseña && (
              <div className={`fortaleza ${fortaleza.toLowerCase()}`}>
                Fortaleza: {fortaleza}
              </div>
            )}
          </div>

          <div className="input-password">
            <input
              type={showRepeatPassword ? "text" : "password"}
              placeholder="Repita la contraseña"
              onChange={(event) => setRepetirContraseña(event.target.value)}
              value={repetirContraseña}
            />
            <span onClick={() => setShowRepeatPassword((prev) => !prev)} className="span-eye">
              {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <h5 className="generoH">Indique su género</h5>
          <div className="genero">
            <button
              type="button"
              className={`M ${genero === "M" ? "active" : ""}`}
              onClick={() => setGenero("M")}
            >
              Masculino
            </button>
            <button
              type="button"
              className={`F ${genero === "F" ? "active" : ""}`}
              onClick={() => setGenero("F")}
            >
              Femenino
            </button>
          </div>
        </form>

        <button
          disabled={loading}
          onClick={handleClick}
          className="registro"
          data-testid="button"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <Link to="/login">¿Ya tenés una cuenta?</Link>
        <Link to="/" className="ultLink">Volver</Link>
      </section>
    </>
  );
}