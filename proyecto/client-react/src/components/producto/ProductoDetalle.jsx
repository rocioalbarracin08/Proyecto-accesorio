import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { usePromociones } from "../../contexts/PromocionesContext";
import ProductoItem from "./ProductoItem";
import { ProductStockDetailInfo } from "./ProductStockIndicator";

import "./productoDetalle.css";

export default function ProductoDetalle() {
  const { id_producto } = useParams();
  const [producto, setProducto] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [coloresDisponibles, setColoresDisponibles] = useState([]);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);

  const { addItem, openCarrito } = useCarrito();
  const { userRole } = useAuthContext();
  const { promociones } = usePromociones();

  // Cargar producto
  useEffect(() => {
    fetch(`http://localhost:5000/productos/${id_producto}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setProducto(data);
        console.log("PRODUCTOS DEL SERVER:", data);  // <-- ACÁ
      })
      .catch((err) => {
        console.error("Error en fetch:", err);
        setError(err.message);
      });
  }, [id_producto]);
  

  // Cargar colores del producto
  useEffect(() => {
    if (!id_producto) return;

    fetch(`http://localhost:5000/colores/producto/${id_producto}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setColoresDisponibles(data || []);
      })
      .catch((err) =>
        console.error("Error cargando colores del producto:", err)
      );
  }, [id_producto]);

  // Cargar relacionados
  useEffect(() => {
    if (producto?.id_categoria) {
      fetch(
        `http://localhost:5000/productos/por_categoria/${producto.id_categoria}?page=1&per_page=5`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then((data) =>
          setProductosRelacionados(
            data.productos.filter((p) => p.id_producto !== id_producto) || []
          )
        )
        .catch((err) => console.error("Error relacionados:", err));
    }
  }, [producto, id_producto]);

  if (error) return <p>Error cargando producto: {error}</p>;
  if (!producto) return <p>Cargando...</p>;

  // Lógica promociones
  const promocionActiva = promociones.find(
    (p) =>
      (p.id_categoria == producto.id_categoria ||
        p.id_producto == producto.id_producto) &&
      p.activo &&
      new Date() >= new Date(p.fecha_inicio) &&
      new Date() <= new Date(p.fecha_fin)
  );

  let precioFinal = producto.precio;
  let precioOriginal = producto.precio;

  if (promocionActiva) {
    if (promocionActiva.tipo_descuento === "porcentaje") {
      precioFinal = producto.precio * (1 - promocionActiva.descuento);
    } else {
      precioFinal = producto.precio - promocionActiva.descuento;
    }
    precioFinal = Math.max(precioFinal, 0);
  }

  // Carrusel
  const nextSlide = () =>
    setCurrentIndex((p) => (p + 1) % productosRelacionados.length);
  const prevSlide = () =>
    setCurrentIndex(
      (p) => (p - 1 + productosRelacionados.length) % productosRelacionados.length
    );

  return (
    <>
      <div className="producto-detalle">
        <img
          src={producto.imagen_url || "/default-product.jpg"}
          alt={producto.name}
          className="producto-imagen"
        />
        <div className="producto-info">
          <h1>{producto.name}</h1>
          <p className="descripcion">
            {producto.descripcion || "Descripción no disponible."}
          </p>

          {/* Precio */}
          <div className="precio-section">
            {promocionActiva ? (
              <>
                <span className="precio-original">
                  ${precioOriginal.toFixed(2)}
                </span>
                <span className="precio-final">${precioFinal.toFixed(2)}</span>
              </>
            ) : (
              <span className="precio">${precioFinal.toFixed(2)}</span>
            )}
          </div>

          {/* Colores disponibles */}
          {coloresDisponibles.length > 0 && (
            <div className="colores-section">
              <p className="color-label">Colores disponibles:</p>

              <div className="colores-lista">
                {coloresDisponibles.map((color) => (
                  <div
                    key={color.id_color}
                    className="color-circulo"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: color.codigo_hex,
                      border:
                        colorSeleccionado?.id_color === color.id_color
                          ? "3px solid black"
                          : "1px solid #aaa",
                      cursor: "pointer",
                      marginRight: 10,
                    }}
                    title={color.nombre_color}
                    onClick={() => setColorSeleccionado(color)}
                  ></div>
                ))}
              </div>

              {colorSeleccionado && (
                <p className="color-elegido">
                  Elegiste: {colorSeleccionado.nombre_color} (
                  {colorSeleccionado.codigo_hex})
                </p>
              )}
            </div>
          )}
          <ProductStockDetailInfo stock={producto.stock} />

          {userRole === "empleado" && <p>Stock: {producto.stock || 0}</p>}

          {/* Botón agregar */}
          <button
            className="agregar-carrito"
            onClick={() => {
              addItem({
                ...producto,
                precio: precioFinal,
                selectedColor: colorSeleccionado || null,
              });
              openCarrito();
            }}
            disabled={producto.stock === 0}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>

      {productosRelacionados.length > 0 && (
        <div className="carrusel-relacionados-fullD">
          <h2>Productos Relacionados</h2>
          <div className="carrusel-container">
            <button
              className="carrusel-btnD"
              onClick={prevSlide}
              disabled={
                productosRelacionados.length <= 4 || currentIndex === 0
              }
            >
              &lt;
            </button>

            <div className="carrusel-slides">
              {productosRelacionados
                .slice(
                  currentIndex,
                  Math.min(currentIndex + 4, productosRelacionados.length)
                )
                .map((prod) => (
                  <ProductoItem key={prod.id_producto} producto={prod} />
                ))}
            </div>

            <button
              className="carrusel-btnD"
              onClick={nextSlide}
              disabled={
                productosRelacionados.length <= 4 ||
                currentIndex >= productosRelacionados.length - 4
              }
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
