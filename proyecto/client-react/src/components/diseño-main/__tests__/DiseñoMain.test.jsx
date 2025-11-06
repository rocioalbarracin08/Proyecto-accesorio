import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import DiseñoMain from "../DiseñoMain"

describe("DiseñoMain Component", () => {
  it("muestra el título principal de la sección", () => {
    render(<DiseñoMain />)
    expect(screen.getByText(/para tus compras/i)).toBeInTheDocument()
  })

  it("renderiza los tres items de información de compra", () => {
    render(<DiseñoMain />)
    // Busca los párrafos de texto
    const textos = [
      "Comprá fácil y rápido",
      "Envíos a todo el país",
      "Pagá como quieras",
    ]

    textos.forEach((texto) => {
      expect(screen.getByText(texto)).toBeInTheDocument()
    })

    // También podés verificar que haya 3 imágenes
    const imagenes = screen.getAllByRole("img")
    expect(imagenes.length).toBe(3)
  })

  it("usa una sección principal con la clase adecuada", () => {
    const { container } = render(<DiseñoMain />)
    const section = container.querySelector(".compras-section")
    expect(section).toBeInTheDocument()
  })
})
