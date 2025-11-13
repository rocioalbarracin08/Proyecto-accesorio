import { useState } from 'react';
import { usePromociones } from '../../contexts/PromocionesContext';
import CrearPromocion from './CrearPromocion';
import EditarPromocion from './EditarPromocion';
import { useNavigate } from 'react-router-dom';
import "./promociones.css";

const Promociones = () => {
  const navigate = useNavigate();
  const { promociones, loading, error, eliminarPromocion, desactivarPromocion, activarPromocion } = usePromociones();  // Agregado activarPromocion
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [editando, setEditando] = useState(null);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="promociones-container">
      <button className="promociones-back-btn" onClick={() => navigate(-1)}>Volver Atrás</button>
      <h1 className="promociones-title">Promociones</h1>
      <button className="promociones-create-btn" onClick={() => setMostrarCrear(true)}>Crear Promoción</button>
      {mostrarCrear && <CrearPromocion onCerrar={() => setMostrarCrear(false)} />}
      {editando && <EditarPromocion promocion={editando} onCerrar={() => setEditando(null)} />}
      <ul className="promociones-list">
        {promociones.map(p => (
          <li key={p.id_promocion} className="promocion-item">
            <div className="promocion-info">
              <p>{p.descripcion} - {p.descuento} ({p.tipo_descuento}) - Activa: {p.activo ? 'Sí' : 'No'}</p>
            </div>
            <div className="promocion-buttons">
              <button className="promocion-btn promocion-btn-edit" onClick={() => setEditando(p)}>Editar</button>
              {p.activo ? (
                <button className="promocion-btn promocion-btn-deactivate" onClick={() => desactivarPromocion(p.id_promocion)}>Desactivar</button>
              ) : (
                <button className="promocion-btn promocion-btn-activate" onClick={() => activarPromocion(p.id_promocion)}>Activar</button>
              )}
              <button className="promocion-btn promocion-btn-delete" onClick={() => eliminarPromocion(p.id_promocion)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Promociones;