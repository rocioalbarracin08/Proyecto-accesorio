import { useCarrito } from "../../context/CarritoContext";
import "./carrito.css";

export function ComprasCarrito() {
  const { state, addItem, removeItem, toggleCarrito } = useCarrito();

  const calcularSubtotal = (item) => item.precio * item.cantidad;

  return (
    <div className="carrito-overlay" onClick={toggleCarrito}>
      <div className="carrito-contenedor" onClick={(e) => e.stopPropagation()}>
        <h2 className="carrito-titulo">🛒 Tu Carrito</h2>

        {state.items.length === 0 ? (
          <p className="carrito-vacio">No hay productos en el carrito.</p>
        ) : (
          <>
            <div className="carrito-lista">
              {state.items.map((item) => (
                <div className="carrito-item" key={item.id_producto || item.id}>
                  <img
                    src={
                      item.imagen || item.imagen_url || "/default-product.jpg"
                    }
                    alt={item.name}
                    className="carrito-item-img"
                  />
                  <div className="carrito-item-info">
                    <h3>{item.name}</h3>
                    <p>${item.precio}</p>
                    <div className="carrito-controles">
                      <button onClick={() => removeItem(item)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => addItem(item)}>+</button>
                    </div>
                    <p className="subtotal">
                      Subtotal: ${calcularSubtotal(item)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="carrito-total">
              <p>
                <strong>Total: </strong>${state.totalPrice}
              </p>
              <button className="cerrar-carrito" onClick={toggleCarrito}>
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
