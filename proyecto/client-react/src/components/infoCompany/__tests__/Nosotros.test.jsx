// import y estilos
import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "./nosotros.css"

import { vi } from "vitest"

// 1) mock de react-router-dom useLocation
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useLocation: () => ({ pathname: "/nosotros" }), // cambia segun test
  }
})

// 2) mock de react-leaflet: devolver simples divs para evitar errores
vi.mock("react-leaflet", () => ({
  MapContainer: (props) => <div data-testid="map">{props.children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}))

// 3) mock global.fetch por defecto (puedes sobrescribirlo en cada test)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ nosotros: { titulo: "Sobre Nosotros", preguntas: [] }, preguntas: { preguntas: [] } }),
  })
)

// 4) mock window.alert si querés espiar
window.alert = vi.fn()

// --- Componente Nosotros ---
// Usa useLocation para decidir si estamos en /nosotros o /nosotros/preguntas
export default function Nosotros() {
  // ruta actual → decide entre "editar nosotros" o "preguntas"
  const location = useLocation()
  const isEditingNosotros = location.pathname === "/nosotros"
  const isEditingPreguntas = location.pathname === "/nosotros/preguntas"

  // datos y estados locales
  const [dataNosotros, setDataNosotros] = useState(null) // objeto con titulo/descripcion/imagenes/preguntas
  const [dataPreguntas, setDataPreguntas] = useState(null) // preguntas de clientes
  const [error, setError] = useState(null)                // mensaje de error de fetch
  const [isEditing, setIsEditing] = useState(false)       // si estamos en modo edición (dueño)
  const [isOwner, setIsOwner] = useState(false)           // si el usuario es dueño (se verifica con fetch)
  const [current, setCurrent] = useState(0)               // índice del carrusel de imágenes
  const [open, setOpen] = useState(null)                 // qué pregunta está abierta (accordion)
  const [nuevaPregunta, setNuevaPregunta] = useState("")  // inputs para agregar/editar pregunta
  const [nuevaRespuesta, setNuevaRespuesta] = useState("")
  const [editingPregunta, setEditingPregunta] = useState(null) // índice en edición

  // --- fetchData: obtiene /nosotros (tanto nosotros como preguntas) ---
  // - setDataNosotros y setDataPreguntas
  // - captura errores y los pone en `error`
  const fetchData = () => {
    setError(null)
    fetch("http://localhost:5000/nosotros", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`Server ${res.status}`)
        return res.json()
      })
      .then(payload => {
        setDataNosotros(payload.nosotros || {})
        setDataPreguntas(payload.preguntas || { preguntas: [] })
      })
      .catch(err => setError(err.message || String(err)))
  }

  // --- useEffect inicial ---
  // 1) llama fetchData()
  // 2) llama /usuarios/es_dueno para setIsOwner
  useEffect(() => {
    fetchData()
    fetch("http://localhost:5000/usuarios/es_dueno", { credentials: "include" })
      .then(res => res.json())
      .then(res => setIsOwner(Boolean(res.es_dueno)))
      .catch(() => setIsOwner(false))
  }, [])

  // UI: estados de error / carga
  if (error) return <div className="nosotros-error">Error cargando datos: {error}</div>
  if (!dataNosotros || !dataPreguntas) return <p>Cargando...</p>

  // defensivas: asegurar arrays
  const preguntasNosotros = dataNosotros.preguntas || []
  const preguntasClientes = dataPreguntas.preguntas || []

  // --- funciones de edición/CRUD local (no hacen fetch inmediato salvo guardarCambios) ---
  // agregarPregunta: agrega localmente a dataNosotros o dataPreguntas según la ruta
  const agregarPregunta = () => {
    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) return
    const targetData = isEditingNosotros ? dataNosotros : dataPreguntas
    const nuevas = [...(targetData.preguntas || []), { pregunta: nuevaPregunta, respuesta: nuevaRespuesta }]
    if (isEditingNosotros) setDataNosotros({ ...dataNosotros, preguntas: nuevas })
    else setDataPreguntas({ ...dataPreguntas, preguntas: nuevas })
    setNuevaPregunta(""); setNuevaRespuesta("")
  }

  // editar / guardar / borrar / cancelar edición: manipulan el estado local
  const editarPregunta = (idx) => { /* set editingPregunta + precargar inputs */ }
  const guardarEdicionPregunta = () => { /* reemplaza item en array */ }
  const borrarPregunta = (idx) => { /* filtra del array */ }
  const cancelarEdicionPregunta = () => { setNuevaPregunta(""); setNuevaRespuesta(""); setEditingPregunta(null) }

  // guardarCambios: hace PUT al backend con dataNosotros o dataPreguntas
  const guardarCambios = () => {
    const url = isEditingNosotros ? "http://localhost:5000/nosotros" : "http://localhost:5000/nosotros/preguntas"
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEditingNosotros ? dataNosotros : dataPreguntas),
      credentials: "include",
    })
      .then(res => { if (!res.ok) throw new Error(res.statusText); return res.json() })
      .then(() => { alert("Guardado"); setIsEditing(false); fetchData() })
      .catch(err => alert(`Error: ${err.message}`))
  }

  // --- render ---
  // Header: título varía según si es dueño o no y según la ruta
  // Si isOwner && isEditing: renderiza el formulario de edición completo (inputs, lista de preguntas, add/editar)
  // Si no: renderiza vista pública con descripción, carrusel de imágenes y sección de preguntas (accordion)
  // Nota especial: para la pregunta índice 2 (tercera) puede mostrar un mapa usando react-leaflet (MapContainer)
}