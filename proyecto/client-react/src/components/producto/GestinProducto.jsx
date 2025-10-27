import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import './GestionProductos.css';

export default function GestionProductos({ onClose, productoEditar = null, onSave }) {
  const { userRole } = useAuthContext();
  const [form, setForm] = useState({
    name: '',
    id_categoria: '',
    precio: '',
    imagen_url: '',
    stock: 0
  });
  const [categorias, setCategorias] = useState([]);

  // Carga categorías al montar
  useEffect(() => {
    fetch('http://localhost:5000/categoria/', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCategorias(data || []))
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  // Si hay producto para editar, llena el form
  useEffect(() => {
    if (productoEditar) {
      setForm({
        name: productoEditar.name || '',
        id_categoria: productoEditar.id_categoria || '',
        precio: productoEditar.precio || '',
        imagen_url: productoEditar.imagen_url || '',
        stock: productoEditar.stock || 0
      });
    }
  }, [productoEditar]);

  if (userRole !== 'empleado') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = productoEditar 
      ? `http://localhost:5000/productos/modificar/${productoEditar.id_producto}` 
      : 'http://localhost:5000/productos/insertar';
    const method = productoEditar ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form) 
      });
      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert('Error al guardar producto');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{productoEditar ? 'Editar Producto' : 'Agregar Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre:
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              required 
            />
          </label>
          <label>
            Categoría:
            <select 
              value={form.id_categoria} 
              onChange={(e) => setForm({...form, id_categoria: e.target.value})} 
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id_category} value={cat.id_category}>{cat.categoria}</option>
              ))}
            </select>
          </label>
          <label>
            Precio:
            <input 
              type="number" 
              step="0.01" 
              value={form.precio} 
              onChange={(e) => setForm({...form, precio: e.target.value})} 
              required 
            />
          </label>
          <label>
            Imagen URL:
            <input 
              type="url" 
              value={form.imagen_url} 
              onChange={(e) => setForm({...form, imagen_url: e.target.value})} 
            />
          </label>
          <label>
            Stock:
            <input 
              type="number" 
              value={form.stock} 
              onChange={(e) => setForm({...form, stock: e.target.value})} 
              required 
            />
          </label>
          <div className="modal-buttons">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}