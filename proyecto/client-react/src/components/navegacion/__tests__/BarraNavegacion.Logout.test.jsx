import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, userEvent } from "../test-utils"; // Usa helpers de test-utils.jsx
import { BarraNavegacion } from "./BarraNavegacion"; // Ajusta ruta

// Mock global para fetch (de setupTests.jsx, simula logout)
globalThis.fetch = vi.fn();

describe("BarraNavegacion - Botón Cerrar Sesión", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Resetea mocks (de vi y setupTests.jsx)
    globalThis.fetch.mockClear();
  });

  it("muestra el botón 'Cerrar sesión' solo si está logueado", () => {
    // Mockea contexto para usuario logueado (de test-utils.jsx)
    mockUseAuthContext.mockReturnValue({ isLogged: true, logout: vi.fn() });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica que el botón aparezca
    expect(screen.getByRole("button", { name: /Cerrar sesión/i })).toBeInTheDocument();
  });

  it("no muestra el botón 'Cerrar sesión' si no está logueado", () => {
    // Mockea contexto para usuario no logueado
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica que el botón NO aparezca
    expect(screen.queryByRole("button", { name: /Cerrar sesión/i })).not.toBeInTheDocument();
  });

  it("llama a logout y navega al hacer click en 'Cerrar sesión'", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();
    // Mockea fetch para logout exitoso
    globalThis.fetch.mockResolvedValueOnce({ ok: true });
    mockUseAuthContext.mockReturnValue({ isLogged: true, logout: mockLogout });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Haz click en el botón
    const logoutButton = screen.getByRole("button", { name: /Cerrar sesión/i });
    await user.click(logoutButton);
    
    // Verifica que se llame a fetch y logout
    expect(globalThis.fetch).toHaveBeenCalledWith("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(mockLogout).toHaveBeenCalled();
  });
});