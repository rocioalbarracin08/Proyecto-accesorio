//Quiero que saque las categorias con sus determinadas imagenes desde la base de datos y las muestre en botones, que al hacer click en la imagen me lleve a la pagina de productos de esa categoria.


//Usar relative y absolut (en css). Para las imagenes (relativa) y texto (absoluto)


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Categorizados() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  const imagenes = { //VER LO QUE HAY EN la DB
    Vinchas: "/img/vinchas.jpg",
    Pulseras: "/img/pulseras.jpg",
  };

  useEffect(() => {
    fetch("http://localhost:5000/categoria/")
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <main>
      <h2>Categorías</h2>
      <div className="categorias-container">
        {categorias.map(cat => (
          <div

            key={cat.id}
            className="categoria"
            onClick={() => navigate(`/productos/${cat.nombre}`)}>
            <img src={imagenes[cat.nombre]} alt={cat.nombre} />
            <span>{cat.nombre}</span>

          </div>
        ))}
      </div>
    </main>
  );
}
