import React from "react";
import { renderWithMockProviders, screen, mockUseAuthContext, waitFor } from "../../../test/test-utils";  // Agrega waitFor aquí
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import CambiarContrasena from "../CambiarContrasena";

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

//OJO CON ESTOOOOOOOOOO IMPORTANTEEEEEEEE
// Mockea el hook useAuthContext REAL para que siempre devuelva el valor de tu mock
vi.mock("../../../contexts/AuthContext", () => ({
  // Asegúrate de que esta ruta sea la ruta correcta a tu archivo useAuthContext.js
  useAuthContext: mockUseAuthContext, 
}));

describe("CambiarContrasena Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch para cubrir tanto /cambiar_contrasena como /logout
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/usuarios/cambiar_contrasena")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ mensaje: "Contraseña cambiada exitosamente." }),
        });
      }
      if (url.includes("/usuarios/logout")) {
        return Promise.resolve({
          ok: true,  // Simula logout exitoso
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza el formulario de cambio de contraseña", () => {
    //mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    renderWithMockProviders(<CambiarContrasena />);
    expect(screen.getByPlaceholderText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Nueva Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar cambio/i })).toBeInTheDocument();
  });

  it("el botón de envío está habilitado inicialmente", () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    renderWithMockProviders(<CambiarContrasena />);
    const submitButton = screen.getByRole("button", { name: /confirmar cambio/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("muestra error si la contraseña actual está vacía", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "nueva123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("La contraseña actual es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error si la nueva contraseña está vacía", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "confirm123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("La nueva contraseña es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error si la nueva contraseña tiene menos de 6 caracteres", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("La nueva contraseña debe tener al menos 6 caracteres.")).toBeInTheDocument();
  });

  it("muestra error si las contraseñas nuevas no coinciden", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "distinta123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("cambia contraseña exitosamente y redirige a login", async () => {
    const mockLogout = vi.fn(() => mockNavigate("/login"));  // Simula que logout navega a /login (comportamiento real)
    mockUseAuthContext.mockReturnValue({ logout: mockLogout });  // Asegura que logout esté definido y simulado
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "nueva123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Contraseña cambiada exitosamente.")).toBeInTheDocument();
      expect(mockLogout).toHaveBeenCalled();  // Verifica que logout se llame
      expect(mockNavigate).toHaveBeenCalledWith("/login");  // Verifica navegación (simulada por mockLogout)
    });
  });

  it("muestra error si la API falla", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });  // Asegura que logout esté definido
    
    // Sobrescribe fetch para este test específico
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: "Contraseña incorrecta" }),
      })
    );
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "wrong123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "nueva123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Contraseña incorrecta")).toBeInTheDocument();
    });
  });
});