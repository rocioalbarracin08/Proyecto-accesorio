import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import axios from "axios";

export default function ProductoItem({
  producto,
  promocion,
  onEdit,
  onDelete,
  onUpdateStock
}) {
  const { addItem, openCarrito } = useCarrito();
  const { userRole } = useAuthContext();

  const [colores, setColores] = useState([]);

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

  // Traemos los colores desde el backend al montar el componente
  useEffect(() => {
    const fetchColores = async () => {
      try {
        const res = await axios.get(`/colores/producto/${producto.id_producto}`);
        setColores(res.data || []);
      } catch (err) {
        console.error("Error al traer colores del producto:", err);
        setColores([]);
      }
    };
    fetchColores();
  }, [producto.id_producto]);

  const handleAddToCart = async () => {
    try {
      // Traer colores desde backend
      const res = await fetch(`http://localhost:5000/colores/producto/${producto.id_producto}`, {
        credentials: "include"
      });
      const coloresDelProducto = await res.json();

      // Agregar al carrito con colores reales
      addItem({
        ...producto,
        precio: precioFinal,
        colores: coloresDelProducto || [],
        selectedColor: null
      });

      openCarrito();
    } catch (err) {
      console.error("Error trayendo colores:", err);

      // fallback si falla fetch
      addItem({
        ...producto,
        precio: precioFinal,
        colores: [],
        selectedColor: null
      });

      openCarrito();
    }
  };

  return (
    <div className="producto-item" style={{ position: "relative" }}>
      <Link to={`/producto/${producto.id_producto || producto.id}`}>
        {promocion && (
          <span className="descuento-etiqueta">
            {promocion.tipo_descuento === "porcentaje"
              ? `${promocion.descuento * 100}% OFF`
              : `$${promocion.descuento} OFF`}
          </span>
        )}

        <img
          src={producto.imagen_url || "/default-product.jpg"}
          alt={producto.name}
        />
        <h2>{producto.name}</h2>
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
      </Link>

      <button className="agregar-carrito" onClick={handleAddToCart}>
        Agregar al Carrito
      </button>

      {userRole === "empleado" &&
        onEdit &&
        onDelete &&
        onUpdateStock && (
          <>
            <p>Stock: {producto.stock || 0}</p>
            <button className="btn-empleado" onClick={() => onEdit(producto)}>
              Editar
            </button>
            <button
              className="btn-empleado"
              onClick={() =>
                onDelete(producto.id_producto || producto.id)
              }
            >
              Desactivar
            </button>
            <button
              className="btn-empleado"
              onClick={() =>
                onUpdateStock(
                  producto.id_producto || producto.id,
                  producto.stock
                )
              }
            >
              Actualizar Stock
            </button>
          </>
        )}
    </div>
  );
}
