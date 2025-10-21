// src/components/CrearPromocion.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { usePromociones } from '../contexts/PromocionesContext';
import './crearEditarPromociones.css';

const CrearPromocion = ({ onCerrar }) => {
  const { cargarPromociones } = usePromociones();
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
      cargarPromociones();
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
          {/* Tus inputs aquí (igual que antes) */}
          <input type="text" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
          {/* ... (repite los demás inputs) */}
          <div className="form-buttons">
            <button type="submit" className="btn-submit">Crear</button>
            <button onClick={onCerrar} className="btn-cancel">Cancelar</button>  {/* Cierra el modal */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPromocion;