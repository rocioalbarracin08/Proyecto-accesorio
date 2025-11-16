import { useState, useEffect } from "react";
import { usePromociones } from "../../contexts/PromocionesContext";
import { Link } from "react-router-dom";
import { ProductStockIndicator } from "./ProductStockIndicator";
import "./carruselPromociones.css";

export function CarruselPromociones({ productos = [] }) {
  const { promociones } = usePromociones();
  const [productosConDescuento, setProductosConDescuento] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Filtrar productos con promoción activa
  useEffect(() => {
    if (!productos || productos.length === 0) return;

    const ahora = new Date();
    const productosPromo = productos.filter(p => {
      const promo = promociones.find(
        pro =>
          (pro.id_categoria === p.id_categoria || pro.id_producto === p.id_producto) &&
          pro.activo &&
          new Date(pro.fecha_inicio) <= ahora &&
          new Date(pro.fecha_fin) >= ahora
      );
      return promo;
    });

    // Shuffle: mezclar para que siempre empiece diferente
    if (productosPromo.length > 0) {
      const shuffled = [...productosPromo].sort(() => Math.random() - 0.5);
      setProductosConDescuento(shuffled);
      // Iniciar en índice aleatorio
      setCurrentIndex(Math.floor(Math.random() * Math.min(shuffled.length, 3)));
    }
  }, [productos, promociones]);

  // Auto-play del carrusel
  useEffect(() => {
    if (!autoPlay || productosConDescuento.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % productosConDescuento.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [autoPlay, productosConDescuento]);

  if (productosConDescuento.length === 0) return null;

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000); // Reanudar después de 10s
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? productosConDescuento.length - 1 : prev - 1
    );
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % productosConDescuento.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const currentProduct = productosConDescuento[currentIndex];
  const promo = promociones.find(
    p =>
      (p.id_categoria === currentProduct.id_categoria ||
        p.id_producto === currentProduct.id_producto) &&
      p.activo &&
      new Date(p.fecha_inicio) <= new Date() &&
      new Date(p.fecha_fin) >= new Date()
  );

  let descuento = 0;
  if (promo) {
    descuento = promo.tipo_descuento === "porcentaje" ? promo.descuento * 100 : promo.descuento;
  }

  const precioOriginal = currentProduct.precio;
  const precioFinal =
    promo && promo.tipo_descuento === "porcentaje"
      ? precioOriginal * (1 - promo.descuento)
      : precioOriginal - promo.descuento;

  return (
    <div className="carrusel-promociones-container">
      <h2 className="carrusel-titulo">✨ Ofertas Destacadas ✨</h2>

      <div className="carrusel-wrapper">
        {/* Botón anterior */}
        <button className="carrusel-btn carrusel-btn-prev" onClick={goToPrev}>
          ◀
        </button>

        {/* Slide actual */}
        <div className="carrusel-slide">
          <Link to={`/producto/${currentProduct.id_producto}`} className="carrusel-link">
            <div className="carrusel-image-container">
              <img
                src={currentProduct.imagen_url || "/default-product.jpg"}
                alt={currentProduct.name}
                className="carrusel-image"
              />
              {descuento > 0 && (
                <div className="carrusel-badge-descuento">
                  {promo.tipo_descuento === "porcentaje" ? `${descuento.toFixed(0)}% OFF` : `$${descuento.toFixed(0)} OFF`}
                </div>
              )}
              <ProductStockIndicator stock={currentProduct.stock} />
            </div>
          </Link>

          <div className="carrusel-info">
            <h3 className="carrusel-nombre">{currentProduct.name}</h3>

            <div className="carrusel-precio">
              <span className="carrusel-precio-original">
                ${precioOriginal.toFixed(2)}
              </span>
              <span className="carrusel-precio-final">
                ${precioFinal.toFixed(2)}
              </span>
            </div>

            {promo && promo.metodo_pago && (
              <p className="carrusel-metodo-pago">
                💳 Pagando con <strong>{promo.metodo_pago}</strong>
              </p>
            )}

            <Link to={`/producto/${currentProduct.id_producto}`} className="carrusel-btn-ver">
              Ver Producto
            </Link>
          </div>
        </div>

        {/* Botón siguiente */}
        <button className="carrusel-btn carrusel-btn-next" onClick={goToNext}>
          ▶
        </button>
      </div>

      {/* Indicadores (dots) */}
      <div className="carrusel-dots">
        {productosConDescuento.map((_, index) => (
          <button
            key={index}
            className={`carrusel-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="carrusel-progress-bar" />
    </div>
  );
}
