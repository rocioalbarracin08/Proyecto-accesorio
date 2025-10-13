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

  useEffect(() => {
    fetch(`http://localhost:5000/productos/por_categoria/${idCategoria}`)
      .then(res => {
        if (!res.ok) throw new Error('Error en servidor');
        return res.json();
      })
      .then(data => {
        setProductos(data);
        if (data.length > 0) {
          setCategoriaNombre(data[0].categoria);  // Del JOIN en backend
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos por categoría:", err);
        setLoading(false);
      });
  }, [idCategoria]);

  if (loading) return <div className="producto-grid">Cargando productos...</div>;

  const getId = (producto) => producto.id_producto || producto.id;

  return (
    <div className="productos-page">
      <h2>Productos de {categoriaNombre} (ID: {idCategoria})</h2>

      <div className="producto-grid">  {/* Usa tu CSS */}
        {productos.length === 0 ? (
          <p>No hay productos en esta categoría.</p>
        ) : (
          productos.map((producto) => (
            <div className="producto-item" key={getId(producto)}>
              <img 
                src={producto.imagen || producto.imagen_url || '/default-product.jpg'}  // Ajusta campo de img
                alt={producto.name}
              />
              <h3>{producto.name}</h3>  {/* Usa 'name' del backend */}
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
      
    </div>
  );
}