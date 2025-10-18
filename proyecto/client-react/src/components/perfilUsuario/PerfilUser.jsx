import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";  // Import necesario para isLogged
import "./perfilUser.css";

export default function PerfilUser() {
  const { isLogged } = useAuthContext();  // Obtiene si el usuario está logueado
  const [datos, setDatos] = useState(null);  // Datos del perfil (nombre, apellido, etc.)
  const [error, setError] = useState("");    // Mensajes de error
  const [loading, setLoading] = useState(false);  // Estado de loading para el formulario

  // Estados para el formulario de cambio de contraseña
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  // Función para manejar el envío del formulario de cambio de contraseña
  const handleCambiarContrasena = async (e) => {
    e.preventDefault();  // Previene recarga de página
    setError("");  // Limpia errores previos
    setLoading(true);  // Muestra loading

    try {
      // Llama al endpoint de backend para cambiar contraseña
      const res = await fetch("http://localhost:5000/usuarios/cambiar_contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contrasena_actual: contrasenaActual,
          nueva_contrasena: nuevaContrasena,
        }),
        credentials: "include",  // Envía cookies con token
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje);  // Muestra mensaje de éxito
        setContrasenaActual("");  // Limpia campos
        setNuevaContrasena("");
      } else {
        setError(data.error);  // Muestra error del backend
      }
    } catch (err) {
      setError("Error de conexión con el servidor");  // Error de red
    } finally {
      setLoading(false);  // Oculta loading
    }
  };

  // useEffect para cargar datos del perfil al montar el componente
  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);  // Error si no está logueado o token inválido
        } else {
          setDatos(data);  // Guarda datos del perfil
        }
      })
      .catch(() => setError("No se pudo obtener los datos del usuario."));
  }, []);

  // Si hay error, muestra mensaje (e.g., no logueado)
  if (error && !datos) return <p>{error}</p>;
  // Si no hay datos, muestra loading
  if (!datos) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-page">  {/* Contenedor principal de la página de perfil */}
      
      {/* Sección de datos del usuario */}
      <section className="datos-cliente-nav">
        <img src="/logos/vectorUsuario.png" className="perfilIG" alt="Perfil" />
        <div className="info-cliente">
          <div><b>{datos.nombre} {datos.apellido}</b></div>
          <div>Género: {datos.genero}</div>
          <div>Email: {datos.email}</div>
        </div>
      </section>

      {/* Formulario de cambio de contraseña, solo si está logueado */}
      {isLogged && (
        <div className="cambiar-contrasena-section">  {/* Contenedor para el formulario */}
          <h2>Cambiar Contraseña</h2>

          {error && <p style={{ color: "red" }}>{error}</p>}  {/* Muestra errores */}
          <form onSubmit={handleCambiarContrasena}>

            <input
              type="password"
              placeholder="Contraseña Actual"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nueva Contraseña"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Cambiando..." : "Cambiar Contraseña"}
            </button>

          </form>
        </div>
      )}
      
    </div>
  );
}