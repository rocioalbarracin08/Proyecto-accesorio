import { useState, useEffect } from 'react';
import axios from 'axios';
import { usePromociones } from '../contexts/PromocionesContext';
import './crearEditarPromociones.css';

const EditarPromocion = ({ promocion, onCerrar }) => {
  const { cargarPromociones } = usePromociones();
  const [form, setForm] = useState(promocion);

  useEffect(() => {
    if (promocion) setForm(promocion);
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
          {/* Inputs idénticos a CrearPromocion, con value={form.campo} */}
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