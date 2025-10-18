import { useEffect, useState } from "react";
import "./datosCliente.css";

export default function DatosCliente() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setDatos(data);
        }
      })
      .catch(() => setError("No se pudo obtener los datos del usuario."));
  }, []);

  if (error) return null;
  if (!datos) return null;

  return (
    <div className="datos-cliente-nav">
      <img src="/logos/vectorUsuario.png" className="perfilIG" alt="Perfil"/>
      <div className="info-cliente">
        <div><b>{datos.nombre} {datos.apellido}</b></div>
        <div>Género: {datos.genero}</div>
        <div>Email: {datos.email}</div>
      </div>
    </div>
  );
}
