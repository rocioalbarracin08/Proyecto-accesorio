import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import useAuth from "../../hooks/useAuth"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./registrarEmpleados.css";

export default function RegistrarEmpleado() {
  // Reutiliza estados del hook useAuth (para campos comunes)
  const {
    usuarioName: nombre, setUsuarioName: setNombre,  // Renombra
    usuarioApellido: apellido, setUsuarioApellido: setApellido,
    email, setEmail,
    contraseña: password, setContraseña: setPassword,  // Renombra password
    error, setError,
  } = useAuth();  // Llama al hook para obtener estados

  // Estados específicos de empleados (no en useAuth)
  const [idTienda, setIdTienda] = useState("");
  const [puestoTrabajo, setPuestoTrabajo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [genero, setGenero] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isOwner } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOwner) {
      setError("Acceso denegado. Solo el dueño puede registrar empleados.");
      navigate("/");
    }
  }, [isOwner, navigate, setError]);  // Agrega setError a dependencias

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación: Incluye campos específicos
    if (!nombre || !apellido || !email || !idTienda || !puestoTrabajo || !telefono || !password || !genero) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/empleados/registro_por_dueno", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          id_tienda: parseInt(idTienda),
          puesto_trabajo: puestoTrabajo,
          telefono,
            genero,
          password,  // Envía password
        }),
        credentials: "include",
      });

      if (response.ok) {
        alert("Empleado registrado exitosamente.");
        // Limpia todos los estados
        setNombre("");
        setApellido("");
        setEmail("");
        setIdTienda("");
        setPuestoTrabajo("");
        setTelefono("");
        setGenero("");
        setPassword("");
      } else {
        const data = await response.json();
        setError(data.error || "Error al registrar empleado.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) return <p>Redirigiendo...</p>;

  return (
    <section className="section-registrar-empleado">
      <h1>Registrar Nuevo Empleado</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="formRegistrarEmpleado">

        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <input type="number" placeholder="ID de Tienda" value={idTienda} onChange={(e) => setIdTienda(e.target.value)} required />

        <input type="text" placeholder="Puesto de Trabajo" value={puestoTrabajo} onChange={(e) => setPuestoTrabajo(e.target.value)} required />

        <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

        <div className="input-password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Cree una contraseña"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="span-eye"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
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

        <button type="submit" disabled={loading} className="btnRegist">
          {loading ? "Registrando..." : "Registrar Empleado"}
        </button>
        <Link to="/">Volver a inicio</Link>
      </form>
    </section>
  );
}