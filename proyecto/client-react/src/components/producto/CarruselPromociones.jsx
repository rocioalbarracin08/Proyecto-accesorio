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
      return !!promo;
    });

    if (productosPromo.length > 0) {
      const shuffled = [...productosPromo].sort(() => Math.random() - 0.5);
      setProductosConDescuento(shuffled);
      setCurrentIndex(Math.floor(Math.random() * Math.min(shuffled.length, 3)));
    }
  }, [productos, promociones]);

  useEffect(() => {
    if (!autoPlay || productosConDescuento.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % productosConDescuento.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, productosConDescuento]);

  if (!productosConDescuento || productosConDescuento.length === 0) return null;

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? productosConDescuento.length - 1 : prev - 1));
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % productosConDescuento.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const currentProduct = productosConDescuento[currentIndex];
  if (!currentProduct) return null;

  // buscar promo actual sobre el producto actual
  const promo = promociones.find(
    p =>
      (p.id_categoria === currentProduct.id_categoria || p.id_producto === currentProduct.id_producto) &&
      p.activo &&
      new Date(p.fecha_inicio) <= new Date() &&
      new Date(p.fecha_fin) >= new Date()
  );

  // parseo seguro de valores numéricos
  const precioOriginal = Number(currentProduct.precio) || 0;
  const promoRaw = promo ? parseFloat(promo.descuento) : 0;
  const promoValido = promo && !isNaN(promoRaw);

  const descuento = promoValido
    ? (promo.tipo_descuento === "porcentaje" ? promoRaw * 100 : promoRaw)
    : 0;

  const precioFinal = promoValido
    ? (promo.tipo_descuento === "porcentaje"
        ? precioOriginal * (1 - promoRaw)
        : precioOriginal - promoRaw)
    : precioOriginal;
  
  const precioFinalSeguro = Math.max(precioFinal, 0);
  return (
    <div className="carrusel-promociones-container">
      <h2 className="carrusel-titulo">Ofertas Destacadas</h2>

      <div className="carrusel-wrapper">
        <button className="carrusel-btn carrusel-btn-prev" onClick={goToPrev}>&lt;</button>

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
                  {promo.tipo_descuento === "porcentaje"
                    ? `${Number(descuento).toFixed(0)}% OFF`
                    : `$${Number(descuento).toFixed(0)} OFF`}
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
                ${precioFinalSeguro.toFixed(2)}
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

        <button className="carrusel-btn carrusel-btn-next" onClick={goToNext}>&gt;</button>
      </div>

      <div className="carrusel-dots">
        {productosConDescuento.map((_, index) => (
          <button
            key={index}
            className={`carrusel-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      <div className="carrusel-progress-bar" />
    </div>
  );
}
