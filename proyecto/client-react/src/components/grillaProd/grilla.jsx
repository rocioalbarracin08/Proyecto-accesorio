import React, { useState, useEffect } from "react";
import './grilla.css';

const Grilla = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/mostrar/productos")
      .then(res => res.json())
      .then(data => setProductos(data.productos))
      .catch(err => console.log("Error cargando productos:", err));
  }, []);

  return (
    <div className="grid-conteiner">
      {productos.map(item => (
        <div key={item.id_producto} className="grid-item">
          <img src={`${item.imagen_url}`} alt={item.name} />
          <h3>{item.name}</h3>
          <p>${item.precio}</p>
        </div>
      ))}
    </div>
  );
}

export default Grilla;
