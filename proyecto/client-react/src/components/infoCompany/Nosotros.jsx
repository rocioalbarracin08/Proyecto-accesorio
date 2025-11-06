import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./nosotros.css";

export default function Nosotros() {
  const location = useLocation();
  const isEditingNosotros = location.pathname === "/nosotros";
  const isEditingPreguntas = location.pathname === "/nosotros/preguntas";

  const [dataNosotros, setDataNosotros] = useState(null);
  const [dataPreguntas, setDataPreguntas] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(null);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [editingPregunta, setEditingPregunta] = useState(null);

  const fetchData = () => {
    setError(null);
    console.log("Fetching /nosotros...");
    fetch("http://localhost:5000/nosotros", { credentials: "include" })
      .then(res => {
        console.log("Respuesta de /nosotros:", res.status);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then(payload => {
        console.log("Datos recibidos del backend:", payload);  // Log para depurar qué llega exactamente
        setDataNosotros(payload.nosotros || {});
        setDataPreguntas(payload.preguntas || { preguntas: [] });  // Fallback si es null
      })
      .catch(err => {
        console.error('Error fetch /nosotros:', err);
        setError(err.message || String(err));
      });
  };

  useEffect(() => {
    fetchData();

    console.log("Verificando si es dueño...");
    fetch("http://localhost:5000/usuarios/es_dueno", { credentials: "include" })
      .then(res => res.json())
      .then(res => {
        console.log("Es dueño:", res.es_dueno);
        setIsOwner(res.es_dueno);
      })
      .catch(err => {
        console.error("Error verificando dueño:", err);
        setIsOwner(false);
      });
  }, []);

  if (error) return <div className="nosotros-error">Error cargando datos: {error}</div>;
  if (!dataNosotros || !dataPreguntas) return <p>Cargando...</p>;

  // Variables seguras: Aseguran que sean arrays para evitar errores en .map()
  const preguntasNosotros = dataNosotros.preguntas || [];
  const preguntasClientes = dataPreguntas.preguntas || [];

  // Agregar nueva pregunta
  const agregarPregunta = () => {
    if (nuevaPregunta.trim() && nuevaRespuesta.trim()) {
      const targetData = isEditingNosotros ? dataNosotros : dataPreguntas;
      const nuevasPreguntas = [...targetData.preguntas, { pregunta: nuevaPregunta, respuesta: nuevaRespuesta }];
      if (isEditingNosotros) {
        setDataNosotros({ ...dataNosotros, preguntas: nuevasPreguntas });
      } else {
        setDataPreguntas({ ...dataPreguntas, preguntas: nuevasPreguntas });
      }
      setNuevaPregunta("");
      setNuevaRespuesta("");
    }
  };

  // Iniciar edición de pregunta existente
  const editarPregunta = (idx) => {
    const targetData = isEditingNosotros ? dataNosotros : dataPreguntas;
    const pregunta = targetData.preguntas[idx];
    setNuevaPregunta(pregunta.pregunta);
    setNuevaRespuesta(pregunta.respuesta);
    setEditingPregunta(idx);
  };

  // Guardar edición de pregunta existente
  const guardarEdicionPregunta = () => {
    if (editingPregunta !== null && nuevaPregunta.trim() && nuevaRespuesta.trim()) {
      const targetData = isEditingNosotros ? dataNosotros : dataPreguntas;
      const nuevasPreguntas = [...targetData.preguntas];
      nuevasPreguntas[editingPregunta] = { pregunta: nuevaPregunta, respuesta: nuevaRespuesta };
      if (isEditingNosotros) {
        setDataNosotros({ ...dataNosotros, preguntas: nuevasPreguntas });
      } else {
        setDataPreguntas({ ...dataPreguntas, preguntas: nuevasPreguntas });
      }
      setNuevaPregunta("");
      setNuevaRespuesta("");
      setEditingPregunta(null);
    }
  };

  // Borrar pregunta
  const borrarPregunta = (idx) => {
    const targetData = isEditingNosotros ? dataNosotros : dataPreguntas;
    const nuevasPreguntas = targetData.preguntas.filter((_, i) => i !== idx);
    if (isEditingNosotros) {
      setDataNosotros({ ...dataNosotros, preguntas: nuevasPreguntas });
    } else {
      setDataPreguntas({ ...dataPreguntas, preguntas: nuevasPreguntas });
    }
  };

  // Cancelar edición de pregunta
  const cancelarEdicionPregunta = () => {
    setNuevaPregunta("");
    setNuevaRespuesta("");
    setEditingPregunta(null);
  };

  // Guardar cambios generales (depende de la ruta)
  const guardarCambios = () => {
    const dataToSave = isEditingNosotros ? dataNosotros : dataPreguntas;
    const url = isEditingNosotros ? "http://localhost:5000/nosotros" : "http://localhost:5000/nosotros/preguntas";
    console.log("Guardando:", dataToSave);
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
      credentials: "include",
    })
      .then(res => {
        console.log("Respuesta de PUT:", res.status);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(() => {
        alert("Guardado exitosamente");
        setIsEditing(false);
        fetchData();
      })
      .catch(err => {
        console.error("Error al guardar:", err);
        alert(`Error: ${err.message}`);
      });
  };

  // Determinar qué datos mostrar/editar
  const currentData = isEditingNosotros ? dataNosotros : dataPreguntas;
  const title = isEditingNosotros ? "Editar Nosotros" : "Editar Preguntas de Clientes";

  return (
    <main className="nosotros-container">
      <div className="nosotros-header">
        <h1 className="nosotros-title">
          {isOwner ? title : (isEditingNosotros ? dataNosotros.titulo : "Preguntas de Clientes")}
        </h1>
        {isOwner && !isEditing && (
          <button className="nosotros-edit-btn" onClick={() => setIsEditing(true)}>Editar</button>
        )}
      </div>

      {isOwner && isEditing ? (
        <section className="nosotros-edit-section">
          {isEditingNosotros && (
            <>
              <label className="nosotros-edit-label">
                Título
                <input
                  className="nosotros-edit-input"
                  value={dataNosotros.titulo}
                  onChange={e => setDataNosotros({ ...dataNosotros, titulo: e.target.value })}
                />
              </label>
              <label className="nosotros-edit-label">
                Descripción
                <textarea
                  className="nosotros-edit-textarea"
                  value={dataNosotros.descripcion}
                  onChange={e => setDataNosotros({ ...dataNosotros, descripcion: e.target.value })}
                />
              </label>
              <label className="nosotros-edit-label">
                Latitud
                <input
                  className="nosotros-edit-input"
                  type="number"
                  step="0.000001"
                  value={dataNosotros.ubicacion_lat}
                  onChange={e => setDataNosotros({ ...dataNosotros, ubicacion_lat: parseFloat(e.target.value) })}
                />
              </label>
              <label className="nosotros-edit-label">
                Longitud
                <input
                  className="nosotros-edit-input"
                  type="number"
                  step="0.000001"
                  value={dataNosotros.ubicacion_lng}
                  onChange={e => setDataNosotros({ ...dataNosotros, ubicacion_lng: parseFloat(e.target.value) })}
                />
              </label>
              <label className="nosotros-edit-label">
                Descripción de Ubicación
                <input
                  className="nosotros-edit-input"
                  value={dataNosotros.ubicacion_descripcion}
                  onChange={e => setDataNosotros({ ...dataNosotros, ubicacion_descripcion: e.target.value })}
                />
              </label>
            </>
          )}

          {/* Sección para editar preguntas existentes */}
          <div className="preguntas-edit-section">
            <h3>Preguntas Existentes</h3>
            {currentData.preguntas.map((item, idx) => (
              <div key={idx} className="pregunta-edit-item">
                <p><strong>Pregunta:</strong> {item.pregunta}</p>
                <p><strong>Respuesta:</strong> {item.respuesta}</p>
                <button className="nosotros-save-btn" onClick={() => editarPregunta(idx)}>Editar</button>
                <button className="nosotros-cancel-btn" onClick={() => borrarPregunta(idx)}>Borrar</button>
              </div>
            ))}
          </div>

          {/* Formulario para agregar o editar pregunta */}
          <div className="preguntas-add-section">
            <h3>{editingPregunta !== null ? "Editar Pregunta" : "Agregar Nueva Pregunta"}</h3>
            <input
              className="nosotros-edit-input"
              placeholder="Pregunta"
              value={nuevaPregunta}
              onChange={e => setNuevaPregunta(e.target.value)}
            />
            <textarea
              className="nosotros-edit-textarea"
              placeholder="Respuesta"
              value={nuevaRespuesta}
              onChange={e => setNuevaRespuesta(e.target.value)}
            />
            {editingPregunta !== null ? (
              <>
                <button className="nosotros-save-btn" onClick={guardarEdicionPregunta}>Guardar Edición</button>
                <button className="nosotros-cancel-btn" onClick={cancelarEdicionPregunta}>Cancelar Edición</button>
              </>
            ) : (
              <button className="nosotros-add-btn" onClick={agregarPregunta}>Agregar Pregunta</button>
            )}
          </div>

          <button className="nosotros-save-btn" onClick={guardarCambios}>Guardar Cambios</button>
          <button className="nosotros-cancel-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
        </section>
      ) : (
        <>
          {/* Vista para NO dueños */}
          {isEditingNosotros && (
            <>
              <section className="nosotros-description">
                <p>{dataNosotros.descripcion}</p>
              </section>

              <section className="carrusel">
                {dataNosotros.imagenes.length > 0 ? (
                  <>
                    <button className="carrusel-btn" onClick={() => setCurrent((current - 1 + dataNosotros.imagenes.length) % dataNosotros.imagenes.length)}>&lt;</button>
                    <img className="carrusel-img" src={dataNosotros.imagenes[current]} alt={`slide-${current}`} />
                    <button className="carrusel-btn" onClick={() => setCurrent((current + 1) % dataNosotros.imagenes.length)}>&gt;</button>
                  </>
                ) : (
                  <p>No hay imágenes disponibles</p>
                )}
              </section>

              <hr className="nosotros-separator" />

              <section className="preguntas-section">
                <div className="preguntas-nosotros">
                  <h3>Preguntas de Nosotros</h3>
                  <div className="preguntas">
                    {preguntasNosotros.map((item, idx) => (  // Usa variable segura
                      <article
                        className={`pregunta-item ${open === `nosotros-${idx}` ? "open" : ""}`}
                        key={`nosotros-${idx}`}
                      >
                        <button
                          className="pregunta-btn"
                          onClick={() => setOpen(open === `nosotros-${idx}` ? null : `nosotros-${idx}`)}
                        >
                          {item.pregunta}
                        </button>
                        <div className="respuesta">
                          <p>{item.respuesta}</p>
                          /*{idx === 2 && /* mapa */}*/
                        </div>
                      </article>

                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Vista para NO dueños en /nosotros/preguntas */}
          {isEditingPreguntas && (
            <section className="preguntas-section">
              <div className="preguntas-clientes">
                <div className="preguntas">
                  {preguntasClientes.map((item, idx) => (  // Usa variable segura
                    <article className="pregunta-item" key={`clientes-${idx}`}>
                      <button className="pregunta-btn" onClick={() => setOpen(open === `clientes-${idx}` ? null : `clientes-${idx}`)}>
                        {item.pregunta}
                      </button>
                      {open === `clientes-${idx}` && (
                        <div className="respuesta">
                          <p>{item.respuesta}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}