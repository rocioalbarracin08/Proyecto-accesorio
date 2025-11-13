import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para consistencia con otros tests (incluye MemoryRouter y providers)
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Usamos userEvent para interacciones más realistas (en lugar de fireEvent)
import RecuperarContrasena from "../RecuperarContrasena"; // Importamos el componente a testear

// Mockeamos fetch globalmente para controlar las llamadas a la API
global.fetch = vi.fn();

describe("RecuperarContrasena Component", () => {
  // Limpiamos los mocks después de cada test para evitar interferencias
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test básico: Verifica que el componente renderice correctamente
  it("renderiza correctamente el formulario de recuperación", () => {
    renderWithProviders(<RecuperarContrasena />);
    
    // Verificamos el título y elementos principales
    expect(screen.getByText(/Recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresa tu email para recibir un enlace de recuperación/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tu email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar email/i })).toBeInTheDocument();
  });

  // Test: Verifica error si el email está vacío
  it("muestra error si el email está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    // Intentamos enviar sin llenar el email (aunque el input tiene required, testeamos la validación extra)
    await user.click(button);
    
    // Verificamos que aparezca el error (el componente valida manualmente)
    expect(screen.getByText("Por favor, ingresa un email válido.")).toBeInTheDocument();
  });

  // Test: Verifica error si el email es inválido
  it("muestra error si se envía un email inválido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    // Llenamos con un email inválido
    await user.type(input, "correo-invalido");
    await user.click(button);
    
    // Verificamos que aparezca el error
    expect(await screen.findByText(/Por favor, ingresa un email válido/i)).toBeInTheDocument();
  });

  // Test: Verifica mensaje de éxito y enlace de reset si el fetch es correcto
  it("muestra mensaje de éxito y enlace de reset si el fetch es correcto", async () => {
    // Mockeamos fetch para simular una respuesta exitosa
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reset_url: "http://localhost:5000/reset/abc123" }),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    // Llenamos con un email válido
    await user.type(input, "usuario@correo.com");
    await user.click(button);
    
    // Esperamos a que aparezca el mensaje de éxito y el enlace
    expect(await screen.findByText(/Email enviado. Revisa tu bandeja de entrada./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir a resetear contraseña/i })).toBeInTheDocument();
  });

  // Test: con error de back
  it("muestra mensaje de error si el fetch falla", async () => {
    // Mockeamos fetch para simular una respuesta de error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Usuario no encontrado." }),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    // Llenamos con un email válido
    await user.type(input, "noexiste@correo.com");
    await user.click(button);
    
    // Verificamos que aparezca el error
    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument();
  });

  // Test: Verifica error de conexión
  it("muestra error de conexión si fetch falla por red", async () => {
    // Mockeamos fetch para simular un error de red (lanza una excepción)
    global.fetch.mockRejectedValueOnce(new Error("Network error"));
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    // Llenamos con un email válido
    await user.type(input, "usuario@correo.com");
    await user.click(button);
    
    // Verificamos que aparezca el error de conexión
    expect(await screen.findByText(/Error de conexión. Verifica tu internet e intenta nuevamente./i)).toBeInTheDocument();
  });

  // Test: Verifica que el enlace de reset no aparezca inicialmente
  it("no muestra el enlace de reset inicialmente", () => {
    renderWithProviders(<RecuperarContrasena />);
    
    // Verificamos que el enlace no esté presente al inicio
    expect(screen.queryByRole("link", { name: /Ir a resetear contraseña/i })).not.toBeInTheDocument();
  });

  // Test: Verifica que el enlace de reset aparezca después de éxito
  it("muestra el enlace de reset después de un envío exitoso", async () => {
    // Mockeamos fetch para simular éxito
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reset_url: "http://localhost:5000/reset/abc123" }),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasena />);
    
    const input = screen.getByPlaceholderText(/Tu email/i);
    const button = screen.getByRole("button", { name: /Enviar email/i });
    
    // Llenamos y enviamos
    await user.type(input, "usuario@correo.com");
    await user.click(button);
    
    // Verificamos que el enlace aparezca
    expect(await screen.findByRole("link", { name: /Ir a resetear contraseña/i })).toBeInTheDocument();
  });
});
