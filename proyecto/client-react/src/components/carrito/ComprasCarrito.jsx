import { useCarrito } from '../../contexts/CarritoContext';  
import './carrito.css'; 

export function ComprasCarrito() {
  const { state, updateQuantity, removeItem, clearCart, toggleCarrito } = useCarrito();  // Accede a funciones del contexto

  const calcularSubtotal = (item) => item.precio * item.cantidad;  // Calcula el subtotal de un item

  return (
    <section className="carrito-overlay" onClick={toggleCarrito}>  {/* Cierra el carrito al hacer clic en el overlay */}
      <section className="carrito-contenedor" onClick={(e) => e.stopPropagation()}>  {/* Evita que el clic cierre el carrito */}
        <h2 className="carrito-titulo">Mis Compras</h2>

        {Object.keys(state.items).length === 0 ? (  // Verifica si el carrito está vacío
          <p className="carrito-vacio">No hay productos en el carrito.</p>
        ) : (
          <>
            <div className="carrito-lista">  {/* Contenedor para la lista de items */}
              {Object.values(state.items).map((item, index) => (
                <div className="carrito-item" key={`${item.producto.id_producto || item.producto.id || index}-${index}`}>
                  <img
                    src={item.producto.imagen || item.producto.imagen_url || "/default-product.jpg"}
                    alt={item.producto.nombre || item.producto.name}
                    className="carrito-item-img"
                  />
                  <div className="carrito-item-info">
                    <h3>{item.producto.nombre || item.producto.name}</h3>
                    <p>${item.producto.precio}</p>
                    <div className="carrito-controles">
                      <button onClick={() => updateQuantity(item.producto.id_producto || item.producto.id, item.cantidad - 1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.producto.id_producto || item.producto.id, item.cantidad + 1)}>+</button>
                    </div>
                    <p className="subtotal">
                      Subtotal: ${(item.cantidad * parseFloat(item.producto.precio || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="carrito-total">  {/* Total del carrito */}
              <p>
                <strong>Total: </strong>${state.totalPrice.toFixed(2)}
              </p>
              <button className="btn-vaciar-carrito" onClick={clearCart}>Vaciar Carrito</button>  {/* Botón para vaciar el carrito */}
              <button className="btn-cerrar-carrito" onClick={toggleCarrito}>Cerrar</button>  {/* Botón para cerrar el carrito */}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
