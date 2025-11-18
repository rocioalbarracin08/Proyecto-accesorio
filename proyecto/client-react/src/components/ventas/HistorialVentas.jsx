import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import './historialVentas.css';

export default function HistorialVentas() {
  const { isLogged, userRole, authChecked } = useAuthContext();
  const [ventas, setVentas] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authChecked) return; // esperar a que sepamos si está autenticado
    if (!isLogged || userRole !== 'empleado') {
      window.location.href = '/login';
    } else {
      cargarVentas();
    }
  }, [isLogged, userRole, page]);

  const cargarVentas = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:5000/ventas/?page=${page}&per_page=2`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error al cargar ventas");
      const data = await response.json();
      setVentas(data.ventas || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError("Error al cargar historial de ventas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  if (loading) return <div className="historial-loading">Cargando historial...</div>;
  if (error) return <div className="historial-error">{error}</div>;

  return (
    <div className="historial-ventas">
      <h2>Mis Ventas Registradas</h2>
      {ventas.length === 0 ? (
        <p>No tienes ventas registradas aún.</p>
      ) : (
        <div className="ventas-lista">
          {ventas.map((venta) => (
            <div key={venta.id_factura} className="venta-item">
              <div className="venta-header">
                <span><strong>Factura #{venta.id_factura}</strong></span>
                <span>{venta.fecha} - {venta.hora}</span>
              </div>
              <div className="venta-detalles">
                <p><strong>Tienda:</strong> {venta.nombre_tienda}</p>
                <p><strong>Método de Pago:</strong> {venta.metodo_pago}</p>
                <p><strong>Total:</strong> ${venta.costo_total}</p>
                <p><strong>Productos:</strong> {venta.productos || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="paginacion">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="btn-paginacion">
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="btn-paginacion">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
