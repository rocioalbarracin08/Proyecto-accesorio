// src/components/Promociones.jsx
import { useState } from 'react';
import { usePromociones } from '../../contexts/PromocionesContext';  // usePromociones: Hook para acceder al contexto global
import CrearPromocion from './CrearPromocion';
import EditarPromocion from './EditarPromocion';
import "./promociones.css";

const Promociones = () => {
  const { promociones, loading, error, eliminarPromocion, desactivarPromocion } = usePromociones();  // Accede a estado y funciones del contexto
  const [mostrarCrear, setMostrarCrear] = useState(false);  // Estado local para mostrar modal de crear
  const [editando, setEditando] = useState(null);  // Estado local para promoción en edición (null si no edita)

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Promociones</h1>
      <button onClick={() => setMostrarCrear(true)}>Crear Promoción</button>  // Abre modal de crear
      {mostrarCrear && <CrearPromocion onCerrar={() => setMostrarCrear(false)} />}  // Pasa onCerrar para cerrar modal (simple prop)
      {editando && <EditarPromocion promocion={editando} onCerrar={() => setEditando(null)} />}  // Pasa promoción y onCerrar
      <ul>
        {promociones.map(p => (
          <li key={p.id_promocion}>
            {p.descripcion} - {p.descuento} ({p.tipo_descuento}) - Activa: {p.activo ? 'Sí' : 'No'}
            <button onClick={() => setEditando(p)}>Editar</button> 
            <button onClick={() => desactivarPromocion(p.id_promocion)}>Desactivar</button> 
            <button onClick={() => eliminarPromocion(p.id_promocion)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Promociones;