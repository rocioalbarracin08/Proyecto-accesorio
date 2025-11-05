import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Categorizados } from "../Categorizados"

// 🧩 Mock del useNavigate para evitar errores de navegación real
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe("Categorizados Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("muestra el mensaje de carga inicialmente", () => {
    // Mock de fetch sin respuesta aún
    global.fetch = vi.fn(() => new Promise(() => {})) // nunca resuelve
    render(
      <BrowserRouter>
        <Categorizados />
      </BrowserRouter>
    )

    expect(screen.getByText(/cargando categorías/i)).toBeInTheDocument()
  })

  it("renderiza la lista de categorías después de cargar", async () => {
    // Mock de fetch con categorías simuladas
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { id_category: 1, categoria: "Ropa", img_url: "ropa.jpg" },
            { id_category: 2, categoria: "Zapatos", img_url: "zapatos.jpg" },
          ]),
      })
    )

    render(
      <BrowserRouter>
        <Categorizados />
      </BrowserRouter>
    )

    // Espera que deje de estar cargando
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    )

    // Verifica que las categorías aparezcan
    expect(screen.getByText("Ropa")).toBeInTheDocument()
    expect(screen.getByText("Zapatos")).toBeInTheDocument()

    // Verifica que haya botones (uno por categoría)
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBe(2)
  })

  it("muestra mensaje si no hay categorías disponibles", async () => {
    // Mock de fetch que devuelve lista vacía
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    )

    render(
      <BrowserRouter>
        <Categorizados />
      </BrowserRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument()
    )
  })
})
