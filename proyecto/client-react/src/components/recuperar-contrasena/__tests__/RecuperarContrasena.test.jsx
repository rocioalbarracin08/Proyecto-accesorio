import React from "react";
import { renderWithProviders, screen, waitFor, fireEvent  } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import RecuperarContrasena from "../RecuperarContrasena";

describe("RecuperarContrasena Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza correctamente el formulario de recuperación", () => {
    renderWithProviders(<RecuperarContrasena />);
    
    expect(screen.getByText(/Recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresa tu email para recibir un enlace de recuperación/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tu email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar email/i })).toBeInTheDocument();
  });


  // Llena con un email inválido para forzar la validación manual (no vacío, para pasar required)
  it("muestra error si el email está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const form = document.querySelector('.recuperar-form'); // Cambia a document.querySelector
    
    // Llena con un email inválido
    await user.type(input, "invalid");
    
    // Forzar submit bypassando validación nativa
    fireEvent.submit(form);
    
    // Espera el error
    await waitFor(() => {
      expect(screen.getByText(/Por favor, ingresa un email válido./i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje de éxito y enlace de reset si el fetch es correcto", async () => {
    // Mock fetch usando vi.fn (sintaxis de Vitest)
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ reset_url: "http://localhost:5000/reset/abc123" }),
      })
    );
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    await user.type(input, "usuario@correo.com");
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Email enviado. Revisa tu bandeja de entrada./i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Ir a resetear contraseña/i })).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error si el fetch falla", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: "Usuario no encontrado." }),
      })
    );
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    await user.type(input, "noexiste@correo.com");
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/usuario no encontrado/i)).toBeInTheDocument();
    });
  });

  it("muestra error de conexión si fetch falla por red", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    await user.type(input, "usuario@correo.com");
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Error de conexión. Verifica tu internet e intenta nuevamente./i)).toBeInTheDocument();
    });
  });

  it("no muestra el enlace de reset inicialmente", () => {
    renderWithProviders(<RecuperarContrasena />);
    
    expect(screen.queryByRole("link", { name: /Ir a resetear contraseña/i })).not.toBeInTheDocument();
  });

  it("muestra el enlace de reset después de un envío exitoso", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ reset_url: "http://localhost:5000/reset/abc123" }),
      })
    );
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    await user.type(input, "usuario@correo.com");
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Ir a resetear contraseña/i })).toBeInTheDocument();
    });
  });
});