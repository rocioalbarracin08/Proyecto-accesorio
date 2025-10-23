import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePromociones } from "../../contexts/PromocionesContext";
import { useCarrito } from "../../contexts/CarritoContext"; 
import axios from "axios";
import "./producto.css";

export function Productos() {
  const { idCategoria } = useParams();
  const { promociones } = usePromociones();

  const [productos, setProductos] = useState([]);
  const [categoriaNombre, setCategoriaNombre] = useState("Cargando...");
  const [loading, setLoading] = useState(true);
  const {addItem, openCarrito } = useCarrito();  // Para carrito

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Promoción activa
  const promocionActiva = promociones.find(
    p => p.id_categoria == idCategoria && p.activo
  );

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/productos/por_categoria/${idCategoria}?page=${page}&per_page=10`,
        { withCredentials: true }
      );
      const data = res.data;
      setProductos(data.productos || []);
      setTotalPages(data.total_pages || 1);
      setPage(data.page || 1);
      if (data.productos && data.productos.length > 0) {
        setCategoriaNombre(data.productos[0].categoria || "");
      }
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [idCategoria, page, promociones]);

  if (loading) return <div className="producto-grid">Cargando productos...</div>;

  const getId = (producto) => producto.id_producto || producto.id;

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const handlePrev = () => goToPage(page - 1);
  const handleNext = () => goToPage(page + 1);

  return (
    <div className="productos-page">
      <h2 className="tituloProducts">Productos de {categoriaNombre}</h2>

      {/* Banner de promoción */}
      {promocionActiva && (
        <div className="promocion-banner">
          <h3>¡Promoción Especial!</h3>
          <p>
            {promocionActiva.descripcion} - Descuento:{" "}
            {promocionActiva.tipo_descuento === "porcentaje"
              ? `${promocionActiva.descuento * 100}% OFF`
              : `${promocionActiva.descuento} OFF`}
          </p>
          <p>Válido hasta: {new Date(promocionActiva.fecha_fin).toLocaleDateString()}</p>
        </div>
      )}

      <div className="producto-grid">
        {productos.length === 0 ? (
          <p>No hay productos en esta categoría.</p>
        ) : (
          productos.map((producto) => {
            let precioFinal = producto.precio;
            if (promocionActiva) {
              if (promocionActiva.tipo_descuento === "porcentaje") {
                precioFinal = precioFinal * (1 - promocionActiva.descuento);
              } else {
                precioFinal = Math.max(precioFinal - promocionActiva.descuento, 0);
              }
            }

            return (
              <div className="producto-item" key={getId(producto)} style={{ position: "relative" }}>
                {promocionActiva && (
                  <span className="descuento-etiqueta">
                    {promocionActiva.tipo_descuento === "porcentaje"
                      ? `${promocionActiva.descuento * 100}% OFF`
                      : `$${promocionActiva.descuento} OFF`}
                  </span>
                )}
                <img
                  src={producto.imagen || producto.imagen_url || "/default-product.jpg"}
                  alt={producto.name}
                />
                <h3>{producto.name}</h3>
                <p className="producto-precio">${precioFinal.toFixed(2)}</p>
                <button
                  className="agregar-carrito"
                  onClick={() => {
                    addItem({ ...producto, precio: precioFinal });
                    openCarrito();  // Abre el carrito al agregar (opcional, quítalo si no lo quieres)
                  }}
                >
                  Agregar al Carrito
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="paginacion">
          <button onClick={handlePrev} disabled={page === 1} className="btn-paginacion">
            Anterior
          </button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`btn-paginacion ${pageNum === page ? "active" : ""}`}
              >
                {pageNum}
              </button>
            );
          })}
          <button onClick={handleNext} disabled={page === totalPages} className="btn-paginacion">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
