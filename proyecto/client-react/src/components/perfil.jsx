import { useEffect } from "react";

export function Perfil() {
  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil2", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  }, []);

  return <div>Perfil</div>;
}
