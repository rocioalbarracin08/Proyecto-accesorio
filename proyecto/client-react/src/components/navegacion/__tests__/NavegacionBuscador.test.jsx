import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithMockProviders, screen, waitFor, mockUseAuthContext, mockUseCarrito } from "../../../test/test-utils";
import { BarraNavegacion } from "../Navegacion";

// Mocks para los contextos (necesarios para que el componente use los mocks en lugar de los hooks reales)
vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext,
}));

vi.mock("../../../contexts/CarritoContext", () => ({
  useCarrito: mockUseCarrito,
}));

// Mock de react-router-dom (necesario porque el componente usa useNavigate y Link)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),  // Mock básico para useNavigate
    Link: ({ to, children }) => <a href={to}>{children}</a>,  // Mock simple para Link
  };
});

describe("BarraNavegacion - Sección Usuario (Perfil)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configura mocks por defecto para AuthContext (ajusta según necesidades del test)
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      userRole: null,
      authChecked: true,
      logout: vi.fn(),
    });
    
    // Configura mocks por defecto para CarritoContext (necesario para el componente)
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra saludo y enlace a perfil si está logueado", async () => {
    mockUseAuthContext.mockReturnValue({
      isLogged: true,
      logout: vi.fn(),
    });

    // Mock fetch basado en URL para evitar dependencias de orden
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ nombre: "Juan" }),
        });
      } else if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([]),  // Devuelve array vacío para categorías
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<BarraNavegacion />);

    await waitFor(() => {
      expect(screen.getByText("Hola, Juan!")).toBeInTheDocument();
    });
    expect(screen.getByAltText("Perfil")).toBeInTheDocument();
  });

  it("muestra enlace a login si no está logueado", () => {
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      logout: vi.fn(),
    });

    renderWithMockProviders(<BarraNavegacion />);

    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});