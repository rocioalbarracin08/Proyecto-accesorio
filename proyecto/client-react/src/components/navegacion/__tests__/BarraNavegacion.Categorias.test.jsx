import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, userEvent, waitFor } from "../test-utils"; // Usa helpers
import { BarraNavegacion } from "./BarraNavegacion";

// Mock global para fetch (de setupTests.jsx, simula obtener categorías)
globalThis.fetch = vi.fn();

describe("BarraNavegacion - Categorías en Tienda", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch.mockClear();
  });

  it("muestra categorías en el submenu de 'Tienda'", async () => {
    // Mockea fetch para devolver categorías
    const mockCategorias = [
      { id_category: 1, categoria: "Electrónica" },
      { id_category: 2, categoria: "Ropa" },
    ];
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategorias,
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Espera que se carguen categorías
    await waitFor(() => {
      expect(screen.getByText("Electrónica")).toBeInTheDocument();
      expect(screen.getByText("Ropa")).toBeInTheDocument();
    });
  });

  it("navega a la página de categoría al hacer click en una", async () => {
    const user = userEvent.setup();
    const mockCategorias = [{ id_category: 1, categoria: "Electrónica" }];
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategorias,
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Espera y haz click en una categoría
    await waitFor(() => screen.getByText("Electrónica"));
    await user.click(screen.getByText("Electrónica"));
    
    // Verifica navegación (mockeada por MemoryRouter)
    expect(window.location.pathname).toBe("/productos/1"); // Ajusta si usas navigate
  });
});