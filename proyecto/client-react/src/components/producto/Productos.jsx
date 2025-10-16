import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";  // Ajusta path si es necesario
import "./producto.css";  // Tu CSS para grid y botones

export function Productos() {
  const { idCategoria } = useParams();  // Lee ID de URL
  const [productos, setProductos] = useState([]);
  const [categoriaNombre, setCategoriaNombre] = useState("Cargando...");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCarrito();  // Para carrito

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/productos/por_categoria/${idCategoria}?page=${page}&per_page=10`)
      .then(res => {
        if (!res.ok) throw new Error('Error en servidor');
        return res.json();
      })
      .then(data => {
        setProductos(data.productos || []);
        setTotalPages(data.total_pages || 1);
        setPage(data.page || 1);
        if (data.productos && data.productos.length > 0) {
          setCategoriaNombre(data.productos[0].categoria || "");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos por categoría:", err);
        setLoading(false);
      });
  }, [idCategoria, page]);

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

      <div className="producto-grid"> 
        {productos.length === 0 ? (
          <p>No hay productos en esta categoría.</p>
        ) : (
          productos.map((producto) => (
            <div className="producto-item" key={getId(producto)}>
              <img 
                src={producto.imagen || producto.imagen_url || '/default-product.jpg'}
                alt={producto.name}
              />
              <h3>{producto.name}</h3>
              <p className="producto-precio">${producto.precio}</p>
              <button 
                className="agregar-carrito" 
                onClick={() => addItem(producto)}
              >
                Agregar al Carrito
              </button>
            </div>
          ))
        )}
      </div>
      {/* Paginación (siempre visible si totalPages > 1) */}
      {totalPages > 1 && (
        <div className="paginacion" style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={handlePrev} disabled={page === 1} className="btn-paginacion" style={{ margin: '0 10px' }}>
            Anterior
          </button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`btn-paginacion ${pageNum === page ? 'active' : ''}`}
                style={{ margin: '0 5px' }}
              >
                {pageNum}
              </button>
            );
          })}
          <button onClick={handleNext} disabled={page === totalPages} className="btn-paginacion" style={{ margin: '0 10px' }}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}