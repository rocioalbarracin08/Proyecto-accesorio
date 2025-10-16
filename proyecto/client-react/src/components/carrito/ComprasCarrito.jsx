import { useCarrito } from "../../context/CarritoContext";
import "./carrito.css";

export function ComprasCarrito() {
  const { state, addItem, updateQuantity, toggleCarrito } = useCarrito();

  const calcularSubtotal = (item) => item.precio * item.cantidad;

  return (
    <div className="carrito-overlay" onClick={toggleCarrito}>
      <div className="carrito-contenedor" onClick={(e) => e.stopPropagation()}>
        <h2 className="carrito-titulo"> Mis compras</h2>

      {Object.keys(state.items).length === 0 ? (
  <p className="carrito-vacio">No hay productos en el carrito.</p>
) : (
  <>
    <div className="carrito-lista">
     {Object.values(state.items).map((item, index) => (
  <div className="carrito-item"
    key={`${item.producto.id_producto || item.producto.id || index}-${index}`}>
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
        <button onClick={() => addItem(item.producto)}>+</button>
      </div>
      <p className="subtotal">
        Subtotal: ${(item.cantidad * parseFloat(item.producto.precio || 0)).toFixed(2)}
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
