import React, { useState, useEffect } from 'react';
import { useCarrito } from '../../context/CarritoContext';
import './producto.css';

export function ProductoGrid() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCarrito();

  const fetchProductos = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/productos/?page=${currentPage}&per_page=10`
        // Sin credentials: público, no envía cookies
      );
      if (!response.ok) throw new Error('Error en servidor');
      const data = await response.json();
      setProductos(data.productos || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [page]);

  // getId ajustado para tu DB (id_producto común)
  const getId = (producto) => producto.id_producto || producto.id || producto._id || producto.codigo;

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const handlePrev = () => goToPage(page - 1);
  const handleNext = () => goToPage(page + 1);

  if (loading) return <div className="producto-grid">Cargando productos...</div>;

  return (
    <div className="producto-grid">
      {productos.map((producto) => (
        <div className="producto-item" key={getId(producto)}>
          <img src={producto.imagen} alt={producto.nombre || producto.name} />
          <h3>{producto.name || producto.nombre}</h3>
          <p className="producto-precio">{producto.precio}</p>
          <button 
            className='agregar-carrito' 
            onClick={() => addItem(producto)}
          >
            Agregar a carrito
          </button>
        </div>
      ))}

      {/* Paginación (siempre visible si totalPages > 1) */}
      {totalPages > 1 && (
        <div className="paginacion" style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3>Página {page} de {totalPages}</h3>
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