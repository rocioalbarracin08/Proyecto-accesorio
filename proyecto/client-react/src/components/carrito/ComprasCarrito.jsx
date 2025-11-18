import { useCarrito } from "../../contexts/CarritoContext";
import { useNavigate } from "react-router-dom"; // Para redireccionar
import "./carrito.css";

export function ComprasCarrito() {
  const { state, updateQuantity, updateItem, removeItem, clearCart, toggleCarrito } = useCarrito();
  const navigate = useNavigate(); // hook de react-router

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

  const handleColorChange = (id, value) => {
    updateItem(id, { selectedColor: value });
  };

  const finalizarCompra = () => {
    toggleCarrito(); // Cierra el modal
    navigate("/factura"); // Redirige a la página de factura
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
                const id = item.producto.id_producto || item.producto.id; // Usamos id_producto como ID único
                return (
                  <div className="carrito-item" key={id}>
                    <img
                      src={
                        item.producto.imagen ||
                        item.producto.imagen_url ||
                        "/default-product.jpg"
                      }
                      alt={item.producto.nombre || item.producto.name}
                      className="carrito-item-img"
                    />
                    <div className="carrito-item-info">
                      <h3>{item.producto.nombre || item.producto.name}</h3>
                      <p>{item.producto.precio}</p>
                        {/* Selector/entrada para color */}
                        <div className="carrito-color-select">
                          {(() => {
                            const raw = item.producto.colores 
                            let options = [];
                            if (Array.isArray(raw)) options = raw;
                            else if (typeof raw === 'string' && raw.includes(',')) options = raw.split(',').map(s => s.trim()).filter(Boolean);
                            else if (typeof raw === 'string' && raw.trim()) options = [raw.trim()];

                            if (options.length > 0) {
                              return (
                                <div>
                                  <label>Color: </label>
                                  <select value={item.selectedColor || ''} onChange={(e) => handleColorChange(id, e.target.value)}>
                                    <option value="">Seleccionar</option>
                                    {options.map((c) => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="otro">Otro...</option>
                                  </select>
                                  {item.selectedColor === 'otro' && (
                                    <input
                                      type="text"
                                      placeholder="Ingrese color"
                                      value={item.selectedColor !== 'otro' ? (item.selectedColor || '') : ''}
                                      onChange={(e) => handleColorChange(id, e.target.value)}
                                    />
                                  )}
                                </div>
                              );
                            }

                            // Si no hay opciones conocidas mostrar un input libre
                            return (
                              <div>
                                <label>Color: </label>
                                <input
                                  type="text"
                                  placeholder="Color (opcional)"
                                  value={item.selectedColor || ''}
                                  onChange={(e) => handleColorChange(id, e.target.value)}
                                />
                              </div>
                            );
                          })()}
                        </div>
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
                      <p className="subtotal">
                        Subtotal: ${calcularSubtotal(item)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="carrito-total">
              <p>
                <strong>Total: </strong>${state.totalPrice.toFixed(2)}
              </p>
              <div className="carrito-botones">
                <button className="btn-vaciar-carrito" onClick={clearCart}>
                  Vaciar Carrito
                </button>
                <button className="btn-cerrar-carrito" onClick={toggleCarrito}>
                  Cerrar
                </button>
                <button className="btn-finalizar-compra" onClick={finalizarCompra}>
                  Finalizar Compra
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}