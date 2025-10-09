import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./producto.css"

export function Productos() {
  const { categoria } = useParams();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/productos/${categoria}`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  }, [categoria]);

  return (
    <div className="producto-grid">
      <h2>Productos de {categoria}</h2>
      {productos.map((producto) => (
        <div className="producto-item" key={producto.id}>

          <img src={producto.imagen} alt={producto.nombre} />
          <h3>{producto.name}</h3>
          <p className="producto-precio">{producto.precio}</p>
          
        </div>
      ))}
    </div>
  );
}
