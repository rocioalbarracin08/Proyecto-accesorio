import React, { useState, useEffect } from 'react';
import './producto.css';


export function ProductoGrid() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/accesorio") // devuelve un json con la lista de productos
      .then(res => res.json())
      .then(data => setProductos(data))//actualiza el estado de productos con la respuesta del bakend
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  return (
    <div className="producto-grid">
      {productos.map((producto) => (
        <div className="producto-item" key={producto.id}> 
          <img src={producto.imagen} alt={producto.nombre} /> 
          <h3>{producto.name}</h3>
          <p className="producto-precio">{producto.precio}</p> 
          <button className='agregar-carrito'>Agregar a carrito</button>
        </div>
      ))}
    </div>
  );
}
