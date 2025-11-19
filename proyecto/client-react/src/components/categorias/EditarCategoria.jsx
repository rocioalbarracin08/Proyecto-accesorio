import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCategorias } from '../../contexts/CategoriasContext';
import './editar-crearCategoria.css';

const EditarCategoria = ({ categoria, onCerrar }) => {
  const { cargarCategorias } = useCategorias();
  const [form, setForm] = useState(categoria);

  useEffect(() => {
    if (categoria) setForm(categoria);
  }, [categoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, activo: form.activo ? 1 : 0 };
      await axios.put(`http://localhost:5000/categoria/${categoria.id_category}`, payload, { withCredentials: true });
      cargarCategorias();
      onCerrar();
    } catch (err) {
      console.error(err);
      alert('Error al editar');
    }
  };

  return (
    <div className="modal-overlayCat">  {/* Cambiado a modal-overlayCat */}
      <div className="modal-contentCat">  {/* Cambiado a modal-contentCat */}
        <h2>Editar Categoría</h2>
        <form className="categoria-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre de la categoría" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required />
          <input type="text" placeholder="URL de imagen" value={form.img_url} onChange={e => setForm({...form, img_url: e.target.value})} />
          <label>
            <input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} />
            Activa
          </label>
          <div className="form-buttons">
            <button type="submit" className="btn-submit">Actualizar</button>
            <button type="button" onClick={onCerrar} className="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarCategoria;