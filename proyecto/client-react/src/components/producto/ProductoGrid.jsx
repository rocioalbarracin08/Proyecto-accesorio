import React, { useState, useEffect } from 'react';
import { useCarrito } from '../../contexts/CarritoContext';
import { useAuthContext } from '../../contexts/AuthContext';
import GestionProductos from './GestionProductos';  // Importa el componente
import './producto.css';

export function ProductoGrid() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);  // Estado para mostrar modal
  const [productoEditar, setProductoEditar] = useState(null);  // Producto a editar
  const { addItem } = useCarrito();
  const { userRole } = useAuthContext();

  const fetchProductos = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/productos/mostrar?page=${currentPage}&per_page=10`,
        { credentials: 'include' }
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

  const getId = (producto) => producto.id_producto || producto.id;

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const handlePrev = () => goToPage(page - 1);
  const handleNext = () => goToPage(page + 1);

  // Funciones para empleados
  const handleEdit = (producto) => {
    setProductoEditar(producto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Desactivar producto?')) {
      await fetch(`http://localhost:5000/productos/desactivar/${id}`, {
        method: 'PATCH', //PEDIR CONSEJO DEL PROFE
        credentials: 'include'
      });
      fetchProductos();
    }
  };

  const handleUpdateStock = async (id, currentStock) => {
    const newStock = prompt('Nuevo stock:', currentStock);
    if (newStock !== null && !isNaN(newStock)) {
      await fetch(`http://localhost:5000/productos/actualizar_stock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stock: parseInt(newStock) })
      });
      fetchProductos();
    }
  };

  const handleAdd = () => {
    setProductoEditar(null);  // Para agregar, no editar
    setShowModal(true);
  };

  const handleSave = () => {
    fetchProductos();  // Recarga productos después de guardar
  };

  if (loading) return <div className="producto-grid">Cargando productos...</div>;

  return (
    <>
      <div className="producto-grid">
        {productos.map((producto) => (
          <div className="producto-item" key={getId(producto)}>
            <img src={producto.imagen_url} alt={producto.name} />
            <h3>{producto.name}</h3>
            <p className="producto-precio">${producto.precio}</p>
            {userRole === 'cliente' && (
              <button className='agregar-carrito' onClick={() => addItem(producto)}>
                Agregar a carrito
              </button>
            )}
            {userRole === 'empleado' && (
              <>
                <p>Stock: {producto.stock || 0}</p>
                <button className='btn-empleado' onClick={() => handleEdit(producto)}>Editar</button>
                <button className='btn-empleado' onClick={() => handleDelete(getId(producto))}>Borrar</button>
                <button className='btn-empleado' onClick={() => handleUpdateStock(getId(producto), producto.stock)}>Actualizar Stock</button>
              </>
            )}
          </div>
        ))}
      </div>

      {userRole === 'empleado' && (
        <button className="btn-agregar-global" onClick={handleAdd}>+</button>
      )}

      {/* Modal para agregar/editar */}
      {showModal && (
        <GestionProductos 
          onClose={() => setShowModal(false)} 
          productoEditar={productoEditar} 
          onSave={handleSave} 
        />
      )}

      {totalPages > 1 && (
        <div className="paginacion" style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={handlePrev} disabled={page === 1} className="btn-paginacion">Anterior</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
            <button key={i + 1} onClick={() => goToPage(i + 1)} className={`btn-paginacion ${page === i + 1 ? 'active' : ''}`}>{i + 1}</button>
          ))}
          <button onClick={handleNext} disabled={page === totalPages} className="btn-paginacion">Siguiente</button>
        </div>
      )}
    </>
  );
}