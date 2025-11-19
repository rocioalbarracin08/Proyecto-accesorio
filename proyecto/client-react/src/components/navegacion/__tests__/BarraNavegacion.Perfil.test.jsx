import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, waitFor, mockUseAuthContext } from "../../../test/test-utils";
import { BarraNavegacion } from "../Navegacion";

describe("BarraNavegacion - Sección Usuario (Perfil)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
          json: async () => ({ categorias: [] }),
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

    // Mock solo para categorías (no hay fetch de perfil)
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categorias: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<BarraNavegacion />);

    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});