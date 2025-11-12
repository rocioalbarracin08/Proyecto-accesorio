import { useState } from 'react';
import axios from 'axios';
import { useCategorias } from '../../contexts/CategoriasContext';
import './editar-crearCategoria.css';

const CrearCategoria = ({ onCerrar }) => {
  const { cargarCategorias } = useCategorias();
  const [form, setForm] = useState({
    categoria: '',
    img_url: '',
    activo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/categoria', form, { withCredentials: true });
      cargarCategorias();
      onCerrar();
    } catch (err) {
      alert('Error al crear');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Crear Categoría</h2>
        <form className="categoria-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre de la categoría" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required />
          <input type="text" placeholder="URL de imagen" value={form.img_url} onChange={e => setForm({...form, img_url: e.target.value})} />
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

export default CrearCategoria;