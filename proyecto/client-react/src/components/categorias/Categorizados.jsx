import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Para navegar al click
import "./categorizado.css"; 

export function Categorizados() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Hook para navegar

  useEffect(() => {
    fetch("http://localhost:5000/categoria/")
      .then(res => res.json())
      .then(data => {
        setCategorias(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando categorías:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <main><h2 className="main-category">Cargando categorías...</h2></main>;

  return (
    <main>
      <h2 className="main-category">Categorías</h2>
      <div className="categorias-container">
        {categorias.length === 0 ? (
          <p>No hay categorías disponibles.</p>
        ) : (
          categorias.map(cat => (
            <button  // Uso button para semántica (no <a>)
              key={cat.id_category}
              className="categoria"
              onClick={() => navigate(`/productos/${cat.id_category}`)}  // Navega con ID
              aria-label={`Ver productos de ${cat.categoria}`}
            >
              <img 
                src={cat.img_url || '/default-category.jpg'}  // Fallback si no hay img
                alt={cat.categoria}
                onError={(e) => { e.target.src = '/placeholder-200x200.jpg'; }}  // Maneja imgs rotas
              />
              <span>{cat.categoria}</span> 
            </button>
          ))
        )}
      </div>
    </main>
  );
}