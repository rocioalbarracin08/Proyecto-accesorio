import { useEffect, useState } from "react";
import "./datosCliente.css";

export default function DatosCliente() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil2", {
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
    <div className="datos-cliente-nav" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img src="/logos/vectorUsuario.png" alt="Perfil" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
      <div style={{ textAlign: "left", fontSize: "0.95rem", color: "#a05252" }}>
        <div><b>{datos.name} {datos.apellido}</b></div>
        <div>Género: {datos.genero}</div>
        <div>Email: {datos.email}</div>
      </div>
    </div>
  );
}
