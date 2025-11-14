import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePromociones } from "../../contexts/PromocionesContext";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import GestionProductos from "./GestionProducto";  // Para empleados
import axios from "axios";
import { Link } from "react-router-dom";  // Agrega esta importación para el enlace al detalle
import "./productos.css";

export function Productos({ includeInactiveForEmployee = false }) {
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

  console.log("UserRole actual:", userRole);  // Verifica en la consola 

  const cargarProductos = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/productos/mostrar?page=${page}&per_page=12`;
      if (idCategoria) {
        url = `http://localhost:5000/productos/por_categoria/${idCategoria}?page=${page}&per_page=10`;
        if (includeInactiveForEmployee && userRole === 'empleado') url += '&include_inactive=1';
      }
      // Para la vista general, si estamos en dashboard empleado y pedimos ver inactivos
      if (!idCategoria && includeInactiveForEmployee && userRole === 'empleado') {
        url = `http://localhost:5000/productos/mostrar?page=${page}&per_page=10&include_inactive=1`;
      }
      const res = await axios.get(url, { withCredentials: true });
      const data = res.data;
      // Si la API devuelve mensaje de categoría inactiva o no encontrada, manejar
      if (res.status === 200 && data.mensaje) {
        // mensajes informativos (no errores HTTP) pueden venir en 200; si contiene 'inact' mostrar como no disponible
        if (String(data.mensaje).toLowerCase().includes('inact')) {
          setProductos([]);
          setCategoriaNombre('Categoría inactiva');
          setTotalPages(1);
          setPage(1);
          return;
        }
      }
      setProductos(data.productos || []);
      setTotalPages(data.total_pages || 1);
      setPage(data.page || 1);
      if (idCategoria && data.productos && data.productos.length > 0) {
        setCategoriaNombre(data.productos[0].categoria || "Categoría");
      } else {
        setCategoriaNombre("Productos");
      }
    } catch (err) {
      // Si la categoría está inactiva, el backend puede devolver 404 con mensaje
      if (err.response && err.response.status === 404 && err.response.data && err.response.data.mensaje) {
        setProductos([]);
        setCategoriaNombre(err.response.data.mensaje || 'Categoría no disponible');
        setTotalPages(1);
        setPage(1);
      } else {
        console.error("Error cargando productos:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [idCategoria, page, promociones]);  // promociones incluido para recargar si cambia

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

  // Función auxiliar para encontrar la promoción activa de un producto
  const getPromocionForProducto = (producto) => {
    if (!promociones || !producto.id_categoria) return null;
    return promociones.find(
      p => p.id_categoria == producto.id_categoria &&  // Compara con el id_categoria del producto
           p.activo &&
           new Date() >= new Date(p.fecha_inicio) &&
           new Date() <= new Date(p.fecha_fin)
    );
  };

  return (
    <div className="productos-page">
      <h2 className="tituloProducts">{categoriaNombre}</h2>

      <div className="producto-grid">
        {productos.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          productos.map((producto) => {
            const promocionProducto = getPromocionForProducto(producto);  // Promoción específica del producto
            let precioFinal = producto.precio;
            let precioOriginal = producto.precio;
            if (promocionProducto) {
              if (promocionProducto.tipo_descuento === "porcentaje") {
                precioFinal = producto.precio * (1 - promocionProducto.descuento);
              } else {
                precioFinal = producto.precio - promocionProducto.descuento;
              }
              precioFinal = Math.max(precioFinal, 0);  // Evita negativos
            }

            return (
              <div className="producto-itemP" key={getId(producto)} style={{ position: "relative" }}>
                {promocionProducto && (
                  <span className="descuento-etiqueta">
                    {promocionProducto.tipo_descuento === "porcentaje"
                      ? `${promocionProducto.descuento * 100}% OFF`
                      : `$${promocionProducto.descuento} OFF`}
                  </span>
                )}
                {/* Enlace al detalle: envuelve la imagen */}
                <Link to={`/producto/${getId(producto)}`}>
                  <img
                    src={producto.imagen || producto.imagen_url || "/default-product.jpg"}
                    alt={producto.name}
                  />
                </Link>
                <h3>{producto.name}</h3>
                <p className="producto-precio">
                  {promocionProducto ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#888' }}>${precioOriginal.toFixed(2)}</span>
                      <br />
                      <span style={{ color: 'red', fontWeight: 'bold' }}>${precioFinal.toFixed(2)}</span>
                    </>
                  ) : (
                    `$${precioFinal.toFixed(2)}`
                  )}
                </p>
                <button
                  className="agregar-carrito"
                  onClick={() => {
                    addItem({ ...producto, precio: precioFinal });
                    openCarrito();
                  }}
                >
                  Agregar al Carrito
                </button>
                
                {userRole === 'empleado' && (
                  <>
                    <p>Stock: {producto.stock || 0}</p>
                    {producto.activo === 0 ? (
                      // Si está desactivado, solo mostrar activar
                      <button className='btn-empleado' onClick={async () => {
                        await fetch(`http://localhost:5000/productos/activar/${getId(producto)}`, {
                          method: 'PATCH',
                          credentials: 'include'
                        });
                        cargarProductos();
                      }}>Activar</button>
                    ) : (
                      // Producto activo: permitir editar/desactivar/actualizar stock
                      <>
                        <button className='btn-empleado' onClick={() => handleEdit(producto)}>Editar</button>
                        <button className='btn-empleado' onClick={() => handleDelete(getId(producto))}>Desactivar</button>
                        <button className='btn-empleado' onClick={() => handleUpdateStock(getId(producto), producto.stock)}>Actualizar Stock</button>
                      </>
                    )}
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
          {(() => {
            const startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`btn-paginacion ${pageNum === page ? "active" : ""}`}
              >
                {pageNum}
              </button>
            ));
          })()}
          <button onClick={handleNext} disabled={page === totalPages} className="btn-paginacion">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}