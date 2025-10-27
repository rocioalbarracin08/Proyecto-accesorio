import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePromociones } from "../../contexts/PromocionesContext";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import GestionProductos from "./GestionProducto";  // Para empleados
import axios from "axios";
import "./producto.css";

export function Productos() {
  const { idCategoria } = useParams();  // Opcional: si hay, filtra por categoría
  const { promociones } = usePromociones();
  const { addItem, openCarrito } = useCarrito();
  const { userRole } = useAuthContext();

  const [productos, setProductos] = useState([]);
  const [categoriaNombre, setCategoriaNombre] = useState("Todos los Productos");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para empleados (de ProductoGrid)
  const [showModal, setShowModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  // Promoción activa (para la categoría actual o general)
  const promocionActiva = promociones.find(
    p => (!idCategoria || p.id_categoria == idCategoria) && p.activo && new Date() >= new Date(p.fecha_inicio) && new Date() <= new Date(p.fecha_fin)
  );
  console.log("UserRole actual:", userRole);  // Verifica en la consola 

  const cargarProductos = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/productos/mostrar?page=${page}&per_page=10`;
      if (idCategoria) {
        url = `http://localhost:5000/productos/por_categoria/${idCategoria}?page=${page}&per_page=10`;
      }
      const res = await axios.get(url, { withCredentials: true });
      const data = res.data;
      setProductos(data.productos || []);
      setTotalPages(data.total_pages || 1);
      setPage(data.page || 1);
      if (idCategoria && data.productos && data.productos.length > 0) {
        setCategoriaNombre(data.productos[0].categoria || "Categoría");
      } else {
        setCategoriaNombre("Todos los Productos");
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

  // Funciones para empleados (de ProductoGrid)
  const handleEdit = (producto) => {
    setProductoEditar(producto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Desactivar producto?')) {
      await fetch(`http://localhost:5000/productos/desactivar/${id}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      cargarProductos();
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
      cargarProductos();
    }
  };

  const handleAdd = () => {
    setProductoEditar(null);
    setShowModal(true);
  };

  const handleSave = () => {
    cargarProductos();
  };

  return (
    <div className="productos-page">
      <h2 className="tituloProducts">{categoriaNombre}</h2>

      {/* Banner de promoción (si aplica) */}
      {promocionActiva && (
        <div className="promocion-banner">
          <h3>¡Promoción Especial!</h3>
          <p>
            {promocionActiva.descripcion} - Descuento:{" "}
            {promocionActiva.tipo_descuento === "porcentaje"
              ? `${promocionActiva.descuento * 100}% OFF`
              : `$${promocionActiva.descuento} OFF`}
          </p>
          <p>Válido hasta: {new Date(promocionActiva.fecha_fin).toLocaleDateString()}</p>
        </div>
      )}

      <div className="producto-grid">
        {productos.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          productos.map((producto) => {
            let precioFinal = producto.precio;
            let precioOriginal = producto.precio;
            if (promocionActiva) {
              if (promocionActiva.tipo_descuento === "porcentaje") {
                precioFinal = producto.precio * (1 - promocionActiva.descuento);
              } else {
                precioFinal = producto.precio - promocionActiva.descuento;
              }
              precioFinal = Math.max(precioFinal, 0);  // Evita negativos
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
                <p className="producto-precio">
                  {promocionActiva ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#888' }}>${precioOriginal.toFixed(2)}</span>
                      <br />
                      <span style={{ color: 'red', fontWeight: 'bold' }}>${precioFinal.toFixed(2)}</span>
                    </>
                  ) : (
                    `$${precioFinal.toFixed(2)}`
                  )}
                </p>
                {userRole === 'cliente' && (
                  <button
                    className="agregar-carrito"
                    onClick={() => {
                      addItem({ ...producto, precio: precioFinal });
                      openCarrito();
                    }}
                  >
                    Agregar al Carrito
                  </button>
                )}
                {userRole === 'empleado' && (
                  <>
                    <p>Stock: {producto.stock || 0}</p>
                    <button className='btn-empleado' onClick={() => handleEdit(producto)}>Editar</button>
                    <button className='btn-empleado' onClick={() => handleDelete(getId(producto))}>Desactivar</button>
                    <button className='btn-empleado' onClick={() => handleUpdateStock(getId(producto), producto.stock)}>Actualizar Stock</button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Botón flotante para empleados */}
      {userRole === 'empleado' && (
        <button className="btn-agregar-global" onClick={handleAdd}>+</button>
      )}

      {/* Modal para empleados */}
      {showModal && (
        <GestionProductos 
          onClose={() => setShowModal(false)} 
          productoEditar={productoEditar} 
          onSave={handleSave} 
        />
      )}

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