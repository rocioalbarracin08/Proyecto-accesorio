import React from 'react';
import './producto.css';

const productos = [
  { id: 1, nombre: 'Bufanda', imagen: 'https://i.pinimg.com/736x/6c/4c/14/6c4c14bebf7f29192fb1c03e04161ae8.jpg', precio: '$12.000' },
  { id: 2, nombre: 'Broche NW', imagen: 'https://i.pinimg.com/736x/87/3e/ba/873ebaa4c141bacd96a3bfba54e5671e.jpg', precio: '$2.000' },
  { id: 3, nombre: 'Cartera XL', imagen: 'https://i.pinimg.com/1200x/63/df/6a/63df6a5f3b256d2c2f6f2283892ae8ea.jpg', precio: '$18.000' },
  { id: 4, nombre: 'Scrunchies', imagen: 'https://i.pinimg.com/736x/9c/80/1f/9c801f1f3e5c387caa1a6d6d15576154.jpg', precio: '$500' },
  { id: 5, nombre: 'Vinchas', imagen: 'https://i.pinimg.com/1200x/2d/4a/cc/2d4acc6329131000bc7b948df0230460.jpg', precio: '$1.500' },
  { id: 6, nombre: 'Gorros JS', imagen: 'https://i.pinimg.com/736x/62/53/48/6253488a8992fa8f9c31894ff7a2388f.jpg', precio: '$2.000' },
  { id: 7, nombre: 'Diademas pink', imagen: 'https://i.pinimg.com/736x/00/e1/e1/00e1e1db7431ea62921c8ea42fe8464e.jpg', precio: '$2.000' },
  { id: 8, nombre: 'Cartera Hermes', imagen: 'https://i.pinimg.com/736x/33/b0/0d/33b00d4a66e32a956ad7d6657463fb0c.jpg', precio: '$16.000' },
 { id: 9, nombre: 'Bufanda princess', imagen: 'https://i.pinimg.com/736x/d4/7d/75/d47d7527e842ff43f6f97548b09927ba.jpg', precio: '$12.000' },
{ id: 10, nombre: 'Broche CL', imagen: 'https://i.pinimg.com/1200x/6a/f8/a5/6af8a5533a01a4ffa8cb869a5957a83c.jpg', precio: '$3.000' },
{ id: 11, nombre: 'Gorro crochet', imagen: 'https://i.pinimg.com/1200x/b6/b7/2e/b6b72e513feaf6a4fcc76e4c3fb7c929.jpg', precio: '$15.000' },
{ id: 12, nombre: 'Scrunchies fino', imagen: 'https://i.pinimg.com/736x/73/f8/37/73f837138706ad0538c702be2d689898.jpg', precio: '$800' },

];

export function ProductoGrid() {
  return (
    <div className="producto-grid">
      {productos.map((producto) => (
        <div className="producto-item" key={producto.id}> /* Agregado key para cada item */
          <img src={producto.imagen} alt={producto.nombre} /> 
          <h3>{producto.nombre}</h3>
          <p className="producto-precio">{producto.precio}</p> 
          <button className='agregar-carrito'>Agregar a carrito</button>
        </div>
      ))}
    </div>
  );
}
