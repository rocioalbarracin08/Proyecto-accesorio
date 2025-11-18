import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithMockProviders, screen, userEvent } from "../../../test/test-utils";
import { BarraNavegacion } from "../Navegacion";
import { mockUseCarrito } from "../../../test/test-utils"; // Importa el mock del carrito

describe("BarraNavegacion - Botón Carrito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch para evitar llamadas reales (perfil y categorías)
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => ({}),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el contador de items en el carrito", () => {
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 5, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica contador (el span con class "carrito-count")
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("llama a toggleCarrito al hacer click en el botón", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();

    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: mockToggle,
      closeCarrito: vi.fn(),
    });

    // Mock completamente válido
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => ({ categorias: [] }),
      })
    );

    renderWithMockProviders(<BarraNavegacion />);
    
    const carritoButton = screen.getByRole("button", { name: /Ver carrito/i, exact: false });
    //El buscador de roles de Testing Library a veces necesita exact: false cuando hay dinámica en labels.
    await user.click(carritoButton);
    
    // Verifica que se llame a toggle
    expect(mockToggle).toHaveBeenCalled();
  });
});