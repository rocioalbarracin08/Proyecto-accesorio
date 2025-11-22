import { useCarrito } from "../../contexts/CarritoContext";
import { useNavigate } from "react-router-dom";
import "./carrito.css";

export function ComprasCarrito() {
  const { state, updateQuantity, updateItem, removeItem, clearCart, toggleCarrito } = useCarrito();
  const navigate = useNavigate();

  if (!state.showCarrito) return null;

  const handleIncrement = (id) => {
    const currentQty = state.items[id]?.cantidad || 0;
    updateQuantity(id, currentQty + 1);
  };

  const handleDecrement = (id) => {
    const currentQty = state.items[id]?.cantidad || 0;
    if (currentQty > 1) updateQuantity(id, currentQty - 1);
    else removeItem(id);
  };

  const calcularSubtotal = (item) =>
    (item.cantidad * parseFloat(item.producto.precio || 0)).toFixed(2);

  const handleColorChange = (id, colorObj) => {
    updateItem(id, { selectedColor: colorObj });
  };

  const finalizarCompra = () => {
    toggleCarrito();
    navigate("/factura");
  };

  return (
    <section className="carrito-overlay" onClick={toggleCarrito}>
      <div className="carrito-contenedor" onClick={(e) => e.stopPropagation()}>
        <h2 className="carrito-titulo">Mis Compras</h2>

        {Object.keys(state.items).length === 0 ? (
          <p className="carrito-vacio">No hay productos en el carrito.</p>
        ) : (
          <>
            <div className="carrito-lista">
              {Object.values(state.items).map((item) => {
                const id = item.producto.id_producto || item.producto.id;

                return (
                  <div className="carrito-item" key={id}>
                    <img
                      src={item.producto.imagen || item.producto.imagen_url || "/default-product.jpg"}
                      alt={item.producto.nombre || item.producto.name}
                      className="carrito-item-img"
                    />

                    <div className="carrito-item-info">
                      <h3>{item.producto.nombre || item.producto.name}</h3>
                      <p>${item.producto.precio}</p>

                      {/* Si el producto tiene colores, mostrar selector */}
                      {Array.isArray(item.producto.colores) && item.producto.colores.length > 0 && (
                        <div className="carrito-colores-container">
                          <p>Elegir color:</p>
                          <div className="carrito-colores-list">
                            {item.producto.colores.map((c) => (
                              <div
                                key={c.id_color}
                                className={`color-circle ${item.selectedColor?.id_color === c.id_color ? "active" : ""}`}
                                style={{ backgroundColor: c.codigo_hex }}
                                onClick={() => handleColorChange(id, c)}
                                title={c.nombre_color}
                              ></div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mostrar color seleccionado */}
                      {item.selectedColor && (
                        <div className="carrito-color-preview">
                          <span>Color elegido:</span>
                          <div
                            className="carrito-color-circle"
                            style={{ backgroundColor: item.selectedColor.codigo_hex }}
                          ></div>
                          <span>{item.selectedColor.nombre_color}</span>
                        </div>
                      )}

                      <div className="carrito-controles">
                        <button onClick={() => handleDecrement(id)}>-</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => handleIncrement(id)}>+</button>
                        <button
                          onClick={() => removeItem(id)}
                          className="btn-eliminar-producto"
                          title="Eliminar producto"
                        >
                          Eliminar
                        </button>
                      </div>

                      <p className="subtotal">Subtotal: ${calcularSubtotal(item)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="carrito-total">
              <p>
                <strong>Total: </strong>${state.totalPrice.toFixed(1)}
              </p>
              <div className="carrito-botones">
                <button className="btn-vaciar-carrito" onClick={clearCart}>
                  Vaciar Carrito
                </button>
                <button className="btn-finalizar-compra" onClick={finalizarCompra}>
                  Finalizar Compra
                </button>
              </div>
            </div>
          </>
        )}

        <button className="btn-cerrar-carrito" onClick={toggleCarrito}>
          Cerrar
        </button>
      </div>
    </section>
  );
}