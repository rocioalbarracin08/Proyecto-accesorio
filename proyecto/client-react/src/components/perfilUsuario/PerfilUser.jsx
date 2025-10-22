import { useEffect, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./perfilUser.css";

export default function PerfilUser() {
  const { isLogged } = useAuthContext();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  const { isOwner } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDatos(data);
        }
      })
      .catch(() => setError("No se pudo obtener los datos del usuario."));
  }, []);

  if (error && !datos) return <p>{error}</p>;
  if (!datos) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-page">
      <section className="datos-cliente-nav">
        <img src="/logos/vectorUsuario.png" className="perfilIG" alt="Perfil" />
        <div className="info-cliente">
          <div><b>{datos.nombre} {datos.apellido}</b></div>
          <div>Género: {datos.genero}</div>
          <div>Email: {datos.email}</div>
        </div>
      </section>

      {isLogged && (
        <div className="cambiar-contrasena-section">
          <button
            className="btn-cambiar-contra"
            onClick={() => navigate("/cambiar-contrasena")}
          >
            Cambiar Contraseña
          </button>
        </div>
      )}
            {/* Apartado condicional para dueño */}
      {isOwner && (
        <div className="apartado-dueno">
          <h2>Opciones de Dueño</h2>
          <Link to="/registrar-empleado">
            <button className="btn-registrar-empleado">Registrar Nuevo Empleado</button>
          </Link>
          <Link to="/promociones">Eliminar | Editar promociones | Crear promociones</Link>
        </div>
      )}
    </div>
  );
}
