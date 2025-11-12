import { useState } from 'react';
import { useCategorias } from '../../contexts/CategoriasContext';
import CrearCategoria from './CrearCategoria';
import EditarCategoria from './EditarCategoria';
import { useNavigate } from 'react-router-dom';
import "./editar-crearCategoria.css";

const Categorias = () => {
  const navigate = useNavigate();
  const { categorias, loading, error, eliminarCategoria, toggleActivo } = useCategorias();
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [editando, setEditando] = useState(null);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="categorias-container">
      <button className="categorias-back-btn" onClick={() => navigate(-1)}>Volver Atrás</button>
      <h1 className="categorias-title">Categorías</h1>
      <button className="categorias-create-btn" onClick={() => setMostrarCrear(true)}>Crear Categoría</button>
      {mostrarCrear && <CrearCategoria onCerrar={() => setMostrarCrear(false)} />}
      {editando && <EditarCategoria categoria={editando} onCerrar={() => setEditando(null)} />}
      <ul className="categorias-list">
        {categorias.map(c => (
          <li key={c.id_category} className="categoria-item">
            <div className="categoria-info">
              <p>{c.categoria} - Activa: {c.activo ? 'Sí' : 'No'}</p>
              {c.img_url && <img src={c.img_url} alt={c.categoria} style={{width: '50px', height: '50px'}} />}
            </div>
            <div className="categoria-buttons">
              <button className="categoria-btn categoria-btn-edit" onClick={() => setEditando(c)}>Editar</button>
              <button className="categoria-btn categoria-btn-toggle" onClick={() => toggleActivo(c.id_category)}>
                {c.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button className="categoria-btn categoria-btn-delete" onClick={() => eliminarCategoria(c.id_category)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categorias;