import { describe, it, expect, vi } from "vitest";
import { renderWithMockProviders, screen, userEvent } from "../../../test/test-utils"; // Usa helpers
import { BarraNavegacion } from "../Navegacion";

describe("BarraNavegacion - Botón Carrito", () => {
  it("muestra el contador de items en el carrito", () => {
    // Mockea contexto del carrito con items
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 5, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica contador
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
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Haz click en el botón del carrito
    const carritoButton = screen.getByRole("button", { name: /Ver carrito/i });
    await user.click(carritoButton);
    
    // Verifica que se llame a toggle
    expect(mockToggle).toHaveBeenCalled();
  });
});