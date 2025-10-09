//Quiero que saque las categorias con sus determinadas imagenes desde la base de datos y las muestre en botones, que al hacer click en la imagen me lleve a la pagina de productos de esa categoria.


//Usar relative y absolut (en css). Para las imagenes (relativa) y texto (absoluto)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./categorizado.css";

export function Categorizados() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/categoria/")
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <main>
      <h2 className="main-category">Categorías</h2>
      <div className="categorias-container">
        <a href=""></a>
        {categorias.map(cat => (
          <a

            key={cat.id_category}
            className="categoria"
            onClick={() => navigate(`/productos/${cat.categoria}`)}>

            <img src={cat.img_url} alt={cat.id_category} />
            <span>{cat.categoria}</span>

          </a>
        ))}
      </div>
    </main>
  );
}
