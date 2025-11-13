import React from "react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";  // Para navegar al click
import "./categorizado.css"; 

export function Categorizados() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Hook para navegar
  const { userRole } = useAuthContext();

  useEffect(() => {
    fetch("http://localhost:5000/categoria/")
      .then(res => res.json())
      .then(data => {
        // Filtrar por categorias activas para usuarios normales; el API devuelve 'activo'
        setCategorias(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando categorías:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <main><h2 className="main-category">cargando categorías...</h2></main>;

  return (
    <main className="category-section">
      <div className="categorias-container">
        {categorias.length === 0 ? (
          <p>No hay categorías disponibles.</p>
        ) : (
          categorias
            // Si es dueño, mostrar todas; si no, solo activas
            .filter(cat => (userRole === 'dueño' ? true : cat.activo === 1))
            .map(cat => (
              <div key={cat.id_category} style={{ display: 'inline-block', margin: 8 }}>
                <button  // Uso button para semántica (no <a>)
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
                {userRole === 'dueño' && (
                  <div style={{ textAlign: 'center' }}>
                    <small style={{ display: 'block' }}>{cat.activo ? 'Activa' : 'Inactiva'}</small>
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:5000/categoria/${cat.id_category}/estado`, {
                            method: 'PATCH',
                            credentials: 'include'
                          });
                          // Refrescar lista
                          const res = await fetch("http://localhost:5000/categoria/");
                          const nuevos = await res.json();
                          setCategorias(nuevos || []);
                        } catch (err) {
                          console.error('Error cambiando estado:', err);
                        }
                      }}
                    >{cat.activo ? 'Desactivar' : 'Activar'}</button>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </main>
  );
}