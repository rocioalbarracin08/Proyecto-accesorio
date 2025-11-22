import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import './gestionProducto.css';

export default function GestionProductos({ onClose, productoEditar = null, onSave }) {
  const { userRole } = useAuthContext();

  const [form, setForm] = useState({
    name: '',
    id_categoria: '',
    precio: '',
    imagen_url: '',
    id_tienda: 1
  });

  const [categorias, setCategorias] = useState([]);

  const [colores, setColores] = useState([]);                  
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]); 

  const [colorSearch, setColorSearch] = useState("");
  const [nuevoHex, setNuevoHex] = useState("#000000");
  const [creandoColor, setCreandoColor] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/categoria/', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCategorias(data || []));

    fetch('http://localhost:5000/usuarios/perfil', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.id_tienda) {
          setForm(prev => ({ ...prev, id_tienda: data.id_tienda }));
        }
      });

    fetch('http://localhost:5000/colores/')
      .then(res => res.json())
      .then(data => setColores(data || []));
  }, []);

  useEffect(() => {
    if (productoEditar) {
      setForm({
        name: productoEditar.name || '',
        id_categoria: productoEditar.id_categoria || '',
        precio: productoEditar.precio || '',
        imagen_url: productoEditar.imagen_url || '',
        id_tienda: productoEditar.id_tienda || form.id_tienda
      });

      fetch(`http://localhost:5000/colores/producto/${productoEditar.id_producto}`)
        .then(res => res.json())
        .then(data => setColoresSeleccionados(data.map(c => c.id_color)));
    }
  }, [productoEditar, form.id_tienda]);

  if (userRole !== 'empleado') return null;

  const toggleColor = (id_color) => {
    setColoresSeleccionados(prev =>
      prev.includes(id_color)
        ? prev.filter(c => c !== id_color)
        : [...prev, id_color]
    );
  };

  const crearColorNuevo = async () => {
    const nombre = colorSearch.trim();
    if (!nombre) {
      alert("El color necesita un nombre.");
      return;
    }

    try {
      setCreandoColor(true);

      const res = await fetch("http://localhost:5000/colores/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre_color: nombre,
          codigo_hex: nuevoHex.toUpperCase()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo crear el color");
        setCreandoColor(false);
        return;
      }

      const nuevo = data.color;

      setColores(prev => [...prev, nuevo]);
      setColoresSeleccionados(prev => [...prev, nuevo.id_color]);

      setColorSearch("");
      setCreandoColor(false);

    } catch {
      alert("Error al crear color");
      setCreandoColor(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = productoEditar
      ? `http://localhost:5000/productos/modificar/${productoEditar.id_producto}`
      : 'http://localhost:5000/productos/insertar';

    const method = productoEditar ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
        return;
      }

      const productoId = productoEditar
        ? productoEditar.id_producto
        : (await res.json()).id_producto;

      await fetch(`http://localhost:5000/colores/a_producto/${productoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ colores: coloresSeleccionados })
      });

      onSave();
      onClose();

    } catch {
      alert("Error de conexión");
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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Categoría:
            <select
              value={form.id_categoria}
              onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id_category} value={cat.id_category}>
                  {cat.categoria}
                </option>
              ))}
            </select>
          </label>

          <label>
            Precio:
            <input
              type="number"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />
          </label>

          <label>
            Imagen URL:
            <input
              type="url"
              value={form.imagen_url}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
            />
          </label>

          {/* ================= COLORES ================= */}
          <label>
            Colores:

            <input
              type="text"
              placeholder="Buscar o crear color..."
              value={colorSearch}
              onChange={(e) => setColorSearch(e.target.value)}
              className="input-color-search"
            />

            <div className="colores-container">
              {colores
                .filter(c =>
                  c.nombre_color.toLowerCase().includes(colorSearch.toLowerCase())
                )
                .map(c => (
                  <div key={c.id_color} className="color-item">
                    <input
                      type="checkbox"
                      checked={coloresSeleccionados.includes(c.id_color)}
                      onChange={() => toggleColor(c.id_color)}
                    />

                    <span>{c.nombre_color}</span>

                    <div
                      className="color-preview"
                      style={{ backgroundColor: c.codigo_hex }}
                    />
                  </div>
                ))}

              {/* opción de crear color nuevo */}
              {colorSearch.trim() !== "" &&
                !colores.some(c =>
                  c.nombre_color.toLowerCase() === colorSearch.toLowerCase()
                ) && (
                  <div className="crear-color">

                    <span>Crear color:</span>

                    {/* picker */}
                    <input
                      type="color"
                      value={nuevoHex}
                      onChange={(e) => setNuevoHex(e.target.value)}
                    />

                    {/* nombre del color */}
                    <input
                      type="text"
                      placeholder="Nombre del color..."
                      value={colorSearch}
                      onChange={(e) => setColorSearch(e.target.value)}
                      className="input-nombre-color"
                    />

                    <button
                      type="button"
                      onClick={crearColorNuevo}
                      disabled={creandoColor}
                    >
                      {creandoColor ? "Creando..." : "Agregar"}
                    </button>
                  </div>
              )}
            </div>
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
