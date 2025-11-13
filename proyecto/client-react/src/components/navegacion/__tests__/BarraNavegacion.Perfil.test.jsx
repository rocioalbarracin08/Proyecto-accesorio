import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, waitFor } from "../../../test/test-utils"; // Usa helpers
import { BarraNavegacion } from "../Navegacion";

// Mock global para fetch (de setupTests.jsx, simula obtener perfil)
globalThis.fetch = vi.fn();

describe("BarraNavegacion - Sección Usuario (Perfil)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch.mockClear();
  });

  it("muestra saludo y enlace a perfil si está logueado", async () => {
    // Mockea contexto y fetch para perfil
    mockUseAuthContext.mockReturnValue({ isLogged: true, logout: vi.fn() });
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nombre: "Juan" }),
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Espera y verifica saludo
    await waitFor(() => {
      expect(screen.getByText("Hola, Juan!")).toBeInTheDocument();
    });
    expect(screen.getByAltText("Perfil")).toBeInTheDocument();
  });

  it("muestra enlace a login si no está logueado", () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica enlace a login
    expect(screen.getByRole("link", { name: /Iniciar sesión/i })).toBeInTheDocument();
  });
});