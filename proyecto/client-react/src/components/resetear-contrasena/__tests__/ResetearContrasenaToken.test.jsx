import React from "react";
import { renderWithProviders, screen, waitFor } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import ResetearContrasenaToken from "../ResetearContrasenaToken";

// Mockea useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: vi.fn(), // Mockearemos en cada test
  };
});

// Importa el mock para configurarlo
import { useSearchParams } from 'react-router-dom';

describe("ResetearContrasenaToken Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el formulario de reseteo de contraseña", () => {
    // Mock token válido
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    renderWithProviders(<ResetearContrasenaToken />);
    expect(screen.getByText(/resetear contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa una nueva contraseña segura/i)).toBeInTheDocument();
  });

  it("muestra los campos de entrada para nueva contraseña y confirmación", () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    renderWithProviders(<ResetearContrasenaToken />);
    expect(screen.getByPlaceholderText(/Nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Actualizar contraseña/i })).toBeInTheDocument();
  });

  it("muestra error si no hay token en la URL", () => {
    // Mock sin token
    useSearchParams.mockReturnValue([new URLSearchParams('')]);
    
    renderWithProviders(<ResetearContrasenaToken />);
    expect(screen.getByText("Enlace inválido. Solicita un nuevo enlace de recuperación.")).toBeInTheDocument();
  });

  it("muestra error si la contraseña no cumple con los requisitos (menos de 8 caracteres)", async () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    await user.type(screen.getByPlaceholderText(/nueva contraseña/i), "123");
    await user.type(screen.getByPlaceholderText(/confirmar contraseña/i), "123");
    
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    await waitFor(() => {
      expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
    });
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Different123!");
    
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden. Verifica e intenta de nuevo.")).toBeInTheDocument();
    });
  });

  it("muestra loading y deshabilita el botón durante el envío", async () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    // Mock fetch con delay para simular loading
    global.fetch = vi.fn(() =>
      new Promise((resolve) => {
        setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100); // Delay de 100ms
      })
    );
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    const submitButton = screen.getByRole("button", { name: /Actualizar contraseña/i });
    await user.click(submitButton);
    
    // Espera a que loading se active (setLoading(true) causa re-render)
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("Actualizando...");
    });
    
    // Espera a que termine (setLoading(false) en finally)
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Actualizar contraseña");
    });
  });

  it("redirige a /login cuando se resetea exitosamente", async () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    // Mock fetch exitoso
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /actualizar contraseña/i }));
    
    await waitFor(() => {
      expect(screen.getByText("¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...")).toBeInTheDocument();
    });
    
    // Simula el setTimeout (3s) y verifica navegación
    await new Promise(resolve => setTimeout(resolve, 3100)); // Un poco más para asegurar
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("muestra error si la API falla", async () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    // Mock fetch con error
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: "Token expirado" }),
      })
    );
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Token expirado")).toBeInTheDocument();
    });
  });

  it("muestra error de conexión si fetch falla por red", async () => {
    useSearchParams.mockReturnValue([new URLSearchParams('?token=valid-token')]);
    
    // Mock fetch con error de red
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Error de conexión. Verifica tu internet e intenta nuevamente./i)).toBeInTheDocument();
    });
  });
});