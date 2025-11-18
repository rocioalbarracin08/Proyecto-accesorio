import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, userEvent, mockUseAuthContext } from "../../../test/test-utils"; // Agrega mockUseAuthContext
import { BarraNavegacion } from "../Navegacion";

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BarraNavegacion - Botón Cerrar Sesión", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch para evitar llamadas reales
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
      })
    );
  });

  it("muestra el botón 'Cerrar sesión' solo si está logueado", () => {
    mockUseAuthContext.mockReturnValue({ isLogged: true, logout: vi.fn() });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    expect(screen.getByRole("button", { name: /Cerrar sesión/i })).toBeInTheDocument();
  });

  it("no muestra el botón 'Cerrar sesión' si no está logueado", () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    expect(screen.queryByRole("button", { name: /Cerrar sesión/i })).not.toBeInTheDocument();
  });

  it("llama a logout y navega al hacer click en 'Cerrar sesión'", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();
    mockUseAuthContext.mockReturnValue({ isLogged: true, logout: mockLogout });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    const logoutButton = screen.getByRole("button", { name: /Cerrar sesión/i });
    await user.click(logoutButton);
    
    // Verifica fetch y logout
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
