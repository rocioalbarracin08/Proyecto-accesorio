import { useState, useEffect } from 'react';
import axios from 'axios';
import { usePromociones } from '../../contexts/PromocionesContext';
import './crearEditarPromociones.css';

const EditarPromocion = ({ promocion, onCerrar }) => {
  const { cargarPromociones } = usePromociones();
  const [metodosPago, setMetodosPago] = useState([]);
  const [form, setForm] = useState(promocion);

  useEffect(() => {
    if (promocion) setForm(promocion);
    // Cargar métodos de pago
    axios.get('http://localhost:5000/metodos_pagos', { withCredentials: true })
      .then(res => setMetodosPago(res.data))
      .catch(err => console.error('Error cargando métodos de pago:', err));
  }, [promocion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/promociones/${promocion.id_promocion}`, form, { withCredentials: true });
      cargarPromociones();
      onCerrar();
    } catch (err) {
      alert('Error al editar');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Promoción</h2>
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
          
          <select value={form.id_metodo_pago} onChange={e => setForm({...form, id_metodo_pago: e.target.value})}>
            <option value="">Método de Pago (opcional)</option>
            {metodosPago.map(mp => (
              <option key={mp.id_metodo_pago} value={mp.id_metodo_pago}>{mp.name}</option>
            ))}
          </select>
          
          <label>
            <input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} />
            Activa
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">Actualizar</button>
            <button onClick={onCerrar} className="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPromocion;