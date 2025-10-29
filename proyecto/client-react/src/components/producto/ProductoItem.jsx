import React from "react";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";

export default function ProductoItem({ producto, promocion, onEdit, onDelete, onUpdateStock }) {
  const { addItem, openCarrito } = useCarrito();
  const { userRole } = useAuthContext();

  const precioOriginal = producto.precio;
  let precioFinal = precioOriginal;
  if (promocion) {
    if (promocion.tipo_descuento === "porcentaje") {
      precioFinal = precioOriginal * (1 - promocion.descuento);
    } else {
      precioFinal = precioOriginal - promocion.descuento;
    }
    precioFinal = Math.max(precioFinal, 0);
  }

  return (
    <div className="producto-item" style={{ position: "relative" }}>
      {promocion && (
        <span className="descuento-etiqueta">
          {promocion.tipo_descuento === "porcentaje"
            ? `${promocion.descuento * 100}% OFF`
            : `$${promocion.descuento} OFF`}
        </span>
      )}

      <img src={producto.imagen_url || "/default-product.jpg"} alt={producto.name} />
      <h3>{producto.name}</h3>
      <p className="producto-precio">
        {promocion ? (
          <>
            <span style={{ textDecoration: "line-through", color: "#888" }}>
              ${precioOriginal.toFixed(2)}
            </span>
            <br />
            <span style={{ color: "red", fontWeight: "bold" }}>
              ${precioFinal.toFixed(2)}
            </span>
          </>
        ) : (
          `$${precioFinal.toFixed(2)}`
        )}
      </p>

      <button
        className="agregar-carrito"
        onClick={() => {
          addItem({ ...producto, precio: precioFinal });
          openCarrito();
        }}
      >
        Agregar al Carrito
      </button>

      {userRole === "empleado" && (
        <>
          <p>Stock: {producto.stock || 0}</p>
          <button className="btn-empleado" onClick={() => onEdit(producto)}>Editar</button>
          <button className="btn-empleado" onClick={() => onDelete(producto.id_producto)}>Desactivar</button>
          <button className="btn-empleado" onClick={() => onUpdateStock(producto.id_producto, producto.stock)}>Actualizar Stock</button>
        </>
      )}
    </div>
  );
}
