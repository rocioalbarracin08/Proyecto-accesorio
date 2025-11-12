import React from "react";
import { renderWithProviders, screen, waitFor } from "../../../test/test-utils";  // Removí 'fire' (innecesario)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Categorizados } from "../Categorizados";

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
  // Limpia mocks antes y después de cada test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();  // Restaura fetch después de cada test
  });

  it("muestra el mensaje de carga inicialmente", () => {
    // Mock de fetch que nunca resuelve (simula carga infinita)
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<Categorizados />);

    // Verifica que se muestre el mensaje de carga
    expect(screen.getByText(/cargando categorías/i)).toBeInTheDocument();
  });

  it("renderiza la lista de categorías después de cargar", async () => {
    // Mock de fetch con categorías simuladas (usa "lentes" y "vinchas" para coincidir con el test)
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve([
        { id_category: 1, categoria: "lentes", img_url: "lentes.jpg" },
        { id_category: 2, categoria: "vinchas", img_url: "vinchas.jpg" },
      ]),
    });

    renderWithProviders(<Categorizados />);

    // Espera que deje de estar cargando
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Verifica que las categorías aparezcan (nombres y botones)
    expect(screen.getByText("lentes")).toBeInTheDocument();
    expect(screen.getByText("vinchas")).toBeInTheDocument();

    // Verifica que haya botones (uno por categoría, con aria-label para accesibilidad)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveAttribute("aria-label", "Ver productos de lentes");  // Coincide con mock
    expect(buttons[1]).toHaveAttribute("aria-label", "Ver productos de vinchas");  // Coincide con mock
  });

  it("muestra mensaje si no hay categorías disponibles", async () => {
    // Mock de fetch que devuelve lista vacía
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve([]),
    });

    renderWithProviders(<Categorizados />);

    // Espera que deje de estar cargando
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Verifica el mensaje de no categorías
    expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
  });

  it("navega correctamente al hacer click en una categoría", async () => {
    // Mock de fetch con una categoría simulada ("lentes")
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve([
        { id_category: 1, categoria: "lentes", img_url: "lentes.jpg" },
      ]),
    });

    renderWithProviders(<Categorizados />);

    // Espera que cargue
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // Simula click en el botón de la categoría (busca "lentes")
    const button = screen.getByRole("button", { name: /ver productos de lentes/i });  // Coincide con mock
    button.click();

    // Verifica que navigate haya sido llamado con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith("/productos/1");
  });

  it("maneja error de conexión al cargar categorías", async () => {
    // Mock de fetch que rechaza (simula error de red)
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error("Network error"));

    renderWithProviders(<Categorizados />);

    // Espera que deje de estar cargando (aunque haya error, setLoading(false) se ejecuta)
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );

    // El componente muestra "No hay categorías disponibles" porque categorias inicia como [] y no se cambia en error
    expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
  });
});