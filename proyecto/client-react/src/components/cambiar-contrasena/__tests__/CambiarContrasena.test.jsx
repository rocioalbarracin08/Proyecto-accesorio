import React from "react";
import { renderWithMockProviders, screen, mockUseAuthContext } from "../../../test/test-utils";
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
  };
});

// Mock de useFormKeyboardNavigation
vi.mock("../../hooks/useFormKeyboardNavigation", () => ({
  useFormKeyboardNavigation: vi.fn(),  // Mockea el hook
}));

describe("CambiarContrasena Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch para evitar llamadas reales
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ mensaje: "Contraseña cambiada" }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza el formulario de cambio de contraseña", () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });
    
    renderWithMockProviders(<CambiarContrasena />);
    expect(screen.getByPlaceholderText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Nueva Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar cambio/i })).toBeInTheDocument();
  });

  it("el botón de envío está habilitado inicialmente", () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });
    
    renderWithMockProviders(<CambiarContrasena />);
    const submitButton = screen.getByRole("button", { name: /confirmar cambio/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("muestra error si la contraseña actual está vacía", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "nueva123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("La contraseña actual es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error si la nueva contraseña está vacía", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "confirm123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("La nueva contraseña es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error si la nueva contraseña tiene menos de 6 caracteres", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("La nueva contraseña debe tener al menos 6 caracteres.")).toBeInTheDocument();
  });

  it("muestra error si las contraseñas nuevas no coinciden", async () => {
    mockUseAuthContext.mockReturnValue({ logout: vi.fn() });
    
    const user = userEvent.setup();
    renderWithMockProviders(<CambiarContrasena />);
    
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "distinta123");
    
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });
});