import React from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";

export default function ProductoItem({ producto, promocion, onEdit, onDelete, onUpdateStock }) {  // Agrega las props opcionales
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

      {/* Enlace al detalle: envuelve la imagen para que sea clickeable */}
      <Link to={`/producto/${producto.id_producto || producto.id}`}>
        <img src={producto.imagen_url || "/default-product.jpg"} alt={producto.name} />
      </Link>
      <h3>
        <Link to={`/producto/${producto.id_producto || producto.id}`}>{producto.name}</Link>
      </h3>
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

      {userRole === "empleado" && onEdit && onDelete && onUpdateStock && (  // Solo muestra si se pasan las props
        <>
          <p>Stock: {producto.stock || 0}</p>
          <button className="btn-empleado" onClick={() => onEdit(producto)}>Editar</button>
          <button className="btn-empleado" onClick={() => onDelete(producto.id_producto || producto.id)}>Desactivar</button>
          <button className="btn-empleado" onClick={() => onUpdateStock(producto.id_producto || producto.id, producto.stock)}>Actualizar Stock</button>
        </>
      )}
    </div>
  );
}