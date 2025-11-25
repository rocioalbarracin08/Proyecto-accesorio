import { useCarrito } from "../../contexts/CarritoContext";
import { useNavigate } from "react-router-dom";
import "./carrito.css";

export function ComprasCarrito() {
  const { state, removeItem, clearCart, toggleCarrito, addColorQuantity, removeColorQuantity } = useCarrito();
  const navigate = useNavigate();

  if (!state.showCarrito) return null;

  const calcularSubtotal = (item) =>
    (item.totalCantidad * parseFloat(item.producto.precio || 0)).toFixed(2);

  const handleColorClick = (id, colorObj) => {
    // Incrementa cantidad del color al hacer clic
    addColorQuantity(id, colorObj.id_color);
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
              {Object.entries(state.items).map(([id, item]) => (
                <div className="carrito-item" key={id}>
                  <img
                    src={item.producto.imagen || item.producto.imagen_url || "/default-product.jpg"}
                    alt={item.producto.nombre || item.producto.name}
                    className="carrito-item-img"
                  />

                  <div className="carrito-item-info">
                    <h3 className="infoP">{item.producto.nombre || item.producto.name}</h3>
                    <p className="infoP">${item.producto.precio}</p>

                    {/* Todos los colores disponibles (destacados si seleccionados) */}
                    {Array.isArray(item.producto.colores) && item.producto.colores.length > 0 && (
                      <div className="carrito-colores-container">
                        <div className="carrito-colores-list">
                          {item.producto.colores.map((c) => (
                            <div
                              key={c.id_color}
                              className={`color-circle ${item.colorQuantities[c.id_color] > 0 ? "selected" : "dimmed"}`}
                              style={{ backgroundColor: c.codigo_hex }}
                              onClick={() => handleColorClick(id, c)}
                              title={c.nombre_color}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lista visual de cantidades por color con controles */}
                    {Object.keys(item.colorQuantities).length > 0 && (
                      <div className="carrito-quantities-list">
                        {Object.entries(item.colorQuantities).map(([colorId, qty]) => {
                          const color = item.producto.colores.find(c => c.id_color == colorId);
                          console.log("Color encontrado:", color); //verifica si el color existe
                          return (
                            <div key={colorId} className="quantity-item">
                              <div
                                className="small-color-circle"
                                style={{ backgroundColor: color?.codigo_hex || "#ccc" }} // Fallback si no hay color
                              ></div>
                              <span>→ {qty}</span>
                              <button onClick={() => addColorQuantity(id, colorId)} className="color-plus">+</button>
                              <button onClick={() => removeColorQuantity(id, colorId)} className="color-minus">-</button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Eliminados los controles globales; ahora solo por color */}
                    <button
                      onClick={() => removeItem(id)}
                      className="btn-eliminar-producto"
                      title="Eliminar producto"
                    >
                      Eliminar
                    </button>

                    <p className="subtotal">Subtotal: ${calcularSubtotal(item)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="carrito-total">
              <strong>Total: </strong>${state.totalPrice.toFixed(1)}
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