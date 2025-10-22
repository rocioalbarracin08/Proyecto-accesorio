// src/components/promociones/CrearPromocion.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { usePromociones } from '../../contexts/PromocionesContext';  // Importa el contexto
import './crearEditarPromociones.css';  // Importa el CSS específico

const CrearPromocion = ({ onCerrar }) => {
  const { cargarPromociones } = usePromociones();  // Accede a la función para recargar promociones
  const [form, setForm] = useState({
    descripcion: '',
    descuento: '',
    tipo_descuento: 'porcentaje',
    fecha_inicio: '',
    fecha_fin: '',
    id_categoria: '',
    id_producto: '',
    activo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/promociones', form, { withCredentials: true });
      cargarPromociones();  // Recarga la lista de promociones
      onCerrar();  // Cierra el modal
    } catch (err) {
      alert('Error al crear');
    }
  };

  return (
    <div className="modal-overlay">  {/* Fondo oscuro que cubre toda la pantalla */}
      <div className="modal-content">  {/* Caja del modal centrada */}
        <h2>Crear Promoción</h2>
        <form className="promocion-form" onSubmit={handleSubmit}>

          <input type="text" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
          <input type="number" step="0.01" placeholder="Descuento" value={form.descuento} onChange={e => setForm({...form, descuento: e.target.value})} required />
          
          <select value={form.tipo_descuento} onChange={e => setForm({...form, tipo_descuento: e.target.value})}>
            <option value="porcentaje">Porcentaje</option>
            <option value="fijo">Fijo</option>
          </select>

          <input type="date" value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})} required />
          <input type="date" value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})} required />
          <input type="number" placeholder="ID Categoría (opcional)" value={form.id_categoria} onChange={e => setForm({...form, id_categoria: e.target.value})} />
          <input type="number" placeholder="ID Producto (opcional)" value={form.id_producto} onChange={e => setForm({...form, id_producto: e.target.value})} />
          
          <label>
            <input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} />
            Activa
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">Crear</button>
            <button onClick={onCerrar} className="btn-cancel">Cancelar</button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default CrearPromocion;