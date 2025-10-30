import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Para obtener id_producto y enlazar
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { usePromociones } from "../../contexts/PromocionesContext"; // Para promociones
import "./productoDetalle.css";

export default function ProductoDetalle() {
  const { id_producto } = useParams();
  const [producto, setProducto] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Para el carrusel
  const { addItem, openCarrito } = useCarrito();
  const { userRole } = useAuthContext();
  const { promociones } = usePromociones();

  useEffect(() => {
    // Fetch del producto individual
    fetch(`http://localhost:5000/productos/${id_producto}`)
      .then(res => res.json())
      .then(data => setProducto(data))
      .catch(err => setError(err.message));

    // Fetch de productos relacionados (misma categoría, limit 5)
    if (producto?.id_categoria) {
      fetch(`http://localhost:5000/productos/por_categoria/${producto.id_categoria}?page=1&per_page=5`)
        .then(res => res.json())
        .then(data => setProductosRelacionados(data.productos.filter(p => p.id_producto !== id_producto) || []))
        .catch(err => console.error("Error cargando relacionados:", err));
    }
  }, [id_producto, producto?.id_categoria]);

  if (error) return <p>Error cargando producto: {error}</p>;
  if (!producto) return <p>Cargando...</p>;

  // Lógica de promociones por categoría/producto
  const promocionActiva = promociones.find(
    p => (p.id_categoria == producto.id_categoria || p.id_producto == producto.id_producto) && p.activo &&
         new Date() >= new Date(p.fecha_inicio) && new Date() <= new Date(p.fecha_fin)
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

  // Clasificar promociones para cartelitos
  const promocionesActivas = promociones.filter(
    p => (p.id_categoria == producto.id_categoria || p.id_producto == producto.id_producto) && p.activo &&
         new Date() >= new Date(p.fecha_inicio) && new Date() <= new Date(p.fecha_fin)
  );

  // Cartelito verde: Promociones con id_metodo_pago (no NULL)
  const cartelitoVerde = promocionesActivas.find(p => p.id_metodo_pago);

  // Cartelito violeta: Promociones solo por categoría (id_metodo_pago NULL, id_categoria no NULL)
  const cartelitoVioleta = promocionesActivas.find(p => !p.id_metodo_pago && p.id_categoria);

  // Cartelito naranja: Promociones con id_metodo_pago Y id_categoria (combinación)
  const cartelitoNaranja = promocionesActivas.find(p => p.id_metodo_pago && p.id_categoria);

  // Funciones del carrusel
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % productosRelacionados.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + productosRelacionados.length) % productosRelacionados.length);

  return (
    <div className="producto-detalle">
      <img src={producto.imagen_url || "/default-product.jpg"} alt={producto.name} />
      <div className="producto-info">
        <h1>{producto.name}</h1>
        <p className="descripcion">{producto.descripcion || "Descripción no disponible."}</p>
        
        {/* Precio con promoción */}
        <div className="precio-section">
          {promocionActiva ? (
            <>
              <span className="precio-original">${precioOriginal.toFixed(2)}</span>
              <span className="precio-final">${precioFinal.toFixed(2)}</span>
              <span className="descuento-etiqueta">
                {promocionActiva.tipo_descuento === "porcentaje"
                  ? `${promocionActiva.descuento * 100}% OFF`
                  : `$${promocionActiva.descuento} OFF`}
              </span>
            </>
          ) : (
            <span className="precio">${precioFinal.toFixed(2)}</span>
          )}
        </div>

        {/* Cartelitos de promociones */}
        {cartelitoVerde && (
          <div className="cartelito-verde">
            {cartelitoVerde.tipo_descuento === "porcentaje"
              ? `${cartelitoVerde.descuento * 100}% OFF pagando con ${cartelitoVerde.metodo_pago}`
              : `$${cartelitoVerde.descuento} OFF pagando con ${cartelitoVerde.metodo_pago}`}
            <br />
            <small>Válido hasta {new Date(cartelitoVerde.fecha_fin).toLocaleDateString()}</small>
          </div>
        )}

        {cartelitoVioleta && (
          <div className="cartelito-violeta">
            Hay promoción en esta categoría
            <br />
            <small>Válido hasta {new Date(cartelitoVioleta.fecha_fin).toLocaleDateString()}</small>
          </div>
        )}

        {cartelitoNaranja && (
          <div className="cartelito-naranja">
            Promo en esta categoría, pagando con {cartelitoNaranja.metodo_pago}
            <br />
            <small>Válido hasta {new Date(cartelitoNaranja.fecha_fin).toLocaleDateString()}</small>
          </div>
        )}

        {userRole === "empleado" && <p>Stock: {producto.stock || 0}</p>}
        
        <button
          className="agregar-carrito"
          onClick={() => {
            addItem({ ...producto, precio: precioFinal });
            openCarrito();
          }}
          disabled={producto.stock === 0}
        >
          Agregar al Carrito
        </button>
      </div>

      {/* Carrusel de productos relacionados */}
      {productosRelacionados.length > 0 && (
        <div className="carrusel-relacionados">
          <h2>Productos Relacionados</h2>
          <div className="carrusel-container">
            <button className="carrusel-btn" onClick={prevSlide}>&lt;</button>
            <div className="carrusel-slides">
              {productosRelacionados.slice(currentIndex, currentIndex + 3).map(prod => (
                <Link key={prod.id_producto} to={`/producto/${prod.id_producto}`} className="relacionado-item">
                  <img src={prod.imagen_url || "/default-product.jpg"} alt={prod.name} />
                  <p>{prod.name}</p>
                  <p>${prod.precio.toFixed(2)}</p>
                </Link>
              ))}
            </div>
            <button className="carrusel-btn" onClick={nextSlide}>&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}