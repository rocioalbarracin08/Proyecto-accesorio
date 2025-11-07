import React from "react";
import { renderWithProviders, screen, fireEvent, waitFor } from ".@/test/test-utils";
import { vi, describe, it, expect } from "vitest";
import { Login } from "../Login";

// Mockea el hook/contexto para evitar dependencias reales. Necesario si Login usa useAuthContext.
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: () => ({ login: vi.fn() }),
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock básico para fetches generales (incluyendo /usuarios/perfil en AuthProvider)
    global.fetch = vi.fn((url) => {
      if (url.includes("/usuarios/perfil")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id_usuario: 1 }),
        });
      }
      // Valor por defecto para evitar errores en otras llamadas
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  it("Renderiza formulario y botón", () => {
    renderWithProviders(<Login />);
    // Queries accesibles. getByRole es preferible para botones. Necesarios para seleccionar elementos.
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("Muestra error si email o contraseña están vacíos al hacer click", async () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    expect(screen.getByText(/por favor, complete todos los campos/i)).toBeInTheDocument();
  });

  it("muestra error si la contraseña es incorrecta", async () => {
    // Reasigna fetch para mockear específicamente /usuarios/login
    global.fetch = vi.fn((url) => {
      if (url.includes("/usuarios/perfil")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id_usuario: 1 }),
        });
      }
      if (url.includes("/usuarios/login")) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: "La contraseña es incorrecta" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument();
    });
  });

  it("muestra error si hay problema de conexión", async () => {
    // Reasigna fetch para mockear específicamente /usuarios/login con error de red
    global.fetch = vi.fn((url) => {
      if (url.includes("/usuarios/perfil")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id_usuario: 1 }),
        });
      }
      if (url.includes("/usuarios/login")) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/error de conexión con el servidor/i)).toBeInTheDocument();
    });
  });
});