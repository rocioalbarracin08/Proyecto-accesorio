import React, { useState, useEffect } from 'react';
import './producto.css';


export function ProductoGrid() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);  // Aquí defines el estado carrito
  
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };
  useEffect(() => {
    fetch("http://127.0.0.1:5000/productos/") // devuelve un json con la lista de productos
      .then(res => res.json())
      .then(data => setProductos(data))//actualiza el estado de productos con la respuesta del bakend
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  // Detectar el campo único del producto
  const getId = (producto) => producto.id || producto._id || producto.codigo;

  return (
    <div className="producto-grid">
      {productos.map((producto) => (
        <div className="producto-item" key={producto.id}> 
          <img src={producto.imagen} alt={producto.nombre} /> 
          <h3>{producto.name}</h3>
          <p className="producto-precio">{producto.precio}</p> 
          <button className='agregar-carrito' onClick={() => agregarAlCarrito(producto)}>Agregar a carrito</button>
        </div>
      ))}
       <div style={{marginTop: '40px'}}>
        <h2>Carrito</h2>
        {carrito.length === 0 ? (
          <p>No hay productos en el carrito.</p>
        ) : (
          <ul>
            {carrito.map((item, idx) => (
              <li key={idx}>
                {item.name} - ${item.precio}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

  );
}
