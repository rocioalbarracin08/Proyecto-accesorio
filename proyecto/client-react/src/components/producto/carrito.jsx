import React from 'react';
import { useCarrito } from '../contexts/CarritoContext';
import './producto.css';  // Tus estilos para .carrito-lateral, modal, etc.

export function Carrito({ isOpen, onClose }) {
  const { state, updateQuantity, removeItem, clearCart, closeCarrito } = useCarrito();

  if (!isOpen) return null;

  const handleIncrement = (id) => {
    const currentQty = state.items[id]?.cantidad || 0;
    updateQuantity(id, currentQty + 1);
  };

  const handleDecrement = (id) => {
    const currentQty = state.items[id]?.cantidad || 0;
    updateQuantity(id, currentQty - 1);
  };

  const handleRemove = (id) => removeItem(id);

  return (
    <section className="modal-overlay" onClick={onClose}>
      <section className="modal-content" onClick={(e) => e.stopPropagation()}>  

        <article className="carrito-lateral"> 
          <h2>Carrito : ({state.totalItems} items)</h2>
          <section>  {/* <section> para contenido del carrito */}
            {Object.values(state.items).length === 0 ? (
              <p>No hay productos en el carrito.</p>
            ) : (
              <>
                <ul>  {/* <ul> semántica para lista de items */}
                  {Object.entries(state.items).map(([id, { producto, cantidad }]) => (
                    <li key={id}>  {/* <li> dentro de <ul> */}
                      <article>  {/* <article> para cada item del carrito */}
                        <span className="nombre-producto">{producto.name || producto.nombre}</span>
                        <span className="precio-producto">${producto.precio} x {cantidad}</span>
                        <div className="cantidad-controles">
                          <button onClick={() => handleDecrement(id)}>-</button>
                          <span>{cantidad}</span>
                          <button onClick={() => handleIncrement(id)}>+</button>
                          <button 
                            onClick={() => handleRemove(id)} 
                            className='btn-borrar-prodct'
                          >
                            Eliminar
                          </button>
                        </div>
                        <span>Subtotal: ${(cantidad * parseFloat(producto.precio || 0)).toFixed(2)}</span>
                      </article>
                    </li>
                  ))}
                </ul>
                
                <footer className="total-carrito">  {/* <footer> para total y botones (pie del carrito) */}
                  <div>Total: ${state.totalPrice.toFixed(2)}</div>
                  <button 
                    onClick={clearCart} 
                    className='btn-vaciar-carrito'
                  >
                    Vaciar Carrito
                  </button>
                  <button 
                    onClick={closeCarrito} 
                    className='btn-cerrar-carrito'
                  >
                    Cerrar
                  </button>
                </footer>
              </>
            )}
          </section>
        </article>
        
      </section>
    </section>
  );
}