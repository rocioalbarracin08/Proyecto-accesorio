import useAuth from "../../hooks/useAuth";
import "./register.css";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  } = useAuth(); // La lógica del programa va en el hook

  const [genero, setGenero] = useState("F");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleClick = async (event) => {
    event.preventDefault();

    // Resetear error antes de validar
    setError("");

    // Validaciones personalizadas
    if (!usuarioName.trim()) {
      return setError("El nombre es obligatorio.");
    }
    if (!usuarioApellido.trim()) {
      return setError("El apellido es obligatorio.");
    }
    if (!email.trim()) {
      return setError("El email es obligatorio.");
    }

    if (!email.includes("@") || !email.includes(".")) {
      return setError("Por favor, ingresa un email válido.");
    }
    if (!contraseña.trim()) {
      return setError("La contraseña es obligatoria.");
    }
    if (contraseña.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }
    if (!repetirContraseña.trim()) {
      return setError("Debes repetir la contraseña.");
    }
    if (contraseña !== repetirContraseña) {
      return setError("Las contraseñas no coinciden.");
    }
    if (!genero) {
      return setError("Debes seleccionar un género.");
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

  // Evento para el input de nombre
  const handleInputUsuario = (event) => {
    setUsuarioName(event.target.value);
  };

  return (
    <>
      <section className="section-register">
        <h1>Registrarse</h1>
        {error && <h5 style={{ color: "red" }}>{error}</h5>} {/* Mostrar mensaje solo si hay error */}
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
            type="text"
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
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="span-eye"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-password">
            <input
              type={showRepeatPassword ? "text" : "password"}
              placeholder="Repita la contraseña"
              onChange={(event) => setRepetirContraseña(event.target.value)}
              value={repetirContraseña}
            />
            <span
              onClick={() => setShowRepeatPassword((prev) => !prev)}
              className="span-eye"
            >
              {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <h5 className="generoH">Indique su género</h5>
          <div className="genero">
            <button type="button" className="M" onClick={() => setGenero("M")}>
              Masculino
            </button>
            <button type="button" className="F" onClick={() => setGenero("F")}>
              Femenino
            </button>
          </div>
        </form>

        <button onClick={handleClick} className="registro" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <Link to="/login">
          ¿Ya tenés una cuenta?
        </Link>
        <Link to="/" className="ultLink">Volver</Link>
      </section>
    </>
  );
}