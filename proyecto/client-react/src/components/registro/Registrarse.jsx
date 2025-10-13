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
  } = useAuth(); //La lógica del programa va en el hook

  const [genero, setGenero] = useState("F");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleClick = async (event) => {
    event.preventDefault();

    //Hacemos la comparación y validaciones
    if (
      usuarioName === "" ||
      usuarioApellido === "" ||
      contraseña === "" ||
      repetirContraseña === "" ||
      email === "" ||
      genero === ""
    ) {
      return setError(true);
    }
    if (contraseña !== repetirContraseña) {
      return setError(true);
    }
    setError(false);
    setLoading(true); //Inicia el proceso de carga de datos

    // Enviar datos al backend
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
        //navigate(-1)
      } else {
        setError(true); // Error en el registro
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false); //Termina el proceso de carga de datos
    }
  };
  //Segunda forma de hace el evento al hacer click
  const handleInputUsuario = (event) => {
    setUsuarioName(event.target.value);
  };

  return (
    <>
      <section className="section-register">
        <h1>Registrarse</h1>
        {error ? <h5>Por favor, complete todos los campos</h5> : ""}
        <form className="formulario">
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

        <button onClick={handleClick} className="registro">Registrarse</button>

        <Link to="/login">
          ¿Ya tenés una cuenta?{" "}
        </Link>
        <Link to="/" className="ultLink">Volver</Link>
      </section>
    </>
  );
}
