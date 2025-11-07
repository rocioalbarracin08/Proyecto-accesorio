import React from "react";
import { renderWithProviders, screen, waitFor } from "../../test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Categorizados } from "../Categorizados"; // Ajusta la ruta si es diferente

// Mock del useNavigate para evitar errores de navegación real
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Categorizados Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el mensaje de carga inicialmente", () => {
    // Mock de fetch que nunca resuelve (simula carga infinita)
    global.fetch = vi.fn(() => new Promise(() => {})); // Nunca resuelve
    renderWithProviders(
        <Categorizados />
    );

    // Verifica que se muestre el mensaje de carga
    expect(screen.getByText(/cargando categorías/i)).toBeInTheDocument();
  });

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
    );

    renderWithProviders(
        <Categorizados />
    );

    // Espera que deje de estar cargando
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Verifica que las categorías aparezcan (nombres y botones)
    expect(screen.getByText("Ropa")).toBeInTheDocument();
    expect(screen.getByText("Zapatos")).toBeInTheDocument();

    // Verifica que haya botones (uno por categoría, con aria-label para accesibilidad)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveAttribute("aria-label", "Ver productos de Ropa");
    expect(buttons[1]).toHaveAttribute("aria-label", "Ver productos de Zapatos");
  });

  it("muestra mensaje si no hay categorías disponibles", async () => {
    // Mock de fetch que devuelve lista vacía
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );

    renderWithProviders(
        <Categorizados />
    );

    // Espera que deje de estar cargando
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Verifica el mensaje de no categorías
    expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
  });

  it("navega correctamente al hacer click en una categoría", async () => {
    // Mock de fetch con una categoría simulada
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { id_category: 1, categoria: "Ropa", img_url: "ropa.jpg" },
          ]),
      })
    );

    renderWithProviders(<Categorizados />);

    // Espera que cargue
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Simula click en el botón de la categoría
    const button = screen.getByRole("button", { name: /ver productos de ropa/i });
    button.click();

    // Verifica que navigate haya sido llamado con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith("/productos/1");
  });

  it("maneja error de conexión al cargar categorías", async () => {
    // Mock de fetch que rechaza (simula error de red)
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    renderWithProviders(<Categorizados />);

    // Espera que deje de estar cargando (aunque haya error, setLoading(false) se ejecuta)
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Verifica que no se muestre nada específico (ya que el componente no maneja errores visuales, solo console.error)
    // Si quieres agregar manejo de errores en el componente (ej. un estado de error), puedes testearlo aquí
    expect(screen.queryByText(/no hay categorías disponibles/i)).not.toBeInTheDocument(); // No debería aparecer
  });
});