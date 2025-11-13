import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir todos los providers (como MemoryRouter para navegación)
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para simular interacciones del usuario, como escribir en inputs y hacer clic
import ResetearContrasenaToken from "../ResetearContrasenaToken"; // Importamos el componente a testear

// Mockeamos useNavigate para controlar la navegación (redirigir a /login)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('?token=valid-token')], // Simulamos un token válido en la URL por defecto
  };
});

// Mockeamos fetch globalmente para controlar las llamadas a la API
global.fetch = vi.fn();

describe("ResetearContrasenaToken Component", () => {
  // Limpiamos los mocks después de cada test para evitar interferencias
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el formulario de reseteo de contraseña", () => {
    renderWithProviders(<ResetearContrasenaToken />);
    expect(screen.getByText(/resetear contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa una nueva contraseña segura/i)).toBeInTheDocument();
  });

  it("muestra los campos de entrada para nueva contraseña y confirmación", () => {
    renderWithProviders(<ResetearContrasenaToken />);
    // Usamos placeholders en lugar de labels, ya que el componente no tiene labels explícitos
    expect(screen.getByPlaceholderText(/Nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirmar contraseña/i)).toBeInTheDocument();
    // Verificamos el botón de envío
    expect(screen.getByRole("button", { name: /Actualizar contraseña/i })).toBeInTheDocument();
  });

  // Test: Verifica error si no hay token en la URL
  it("muestra error si no hay token en la URL", () => {
    // Mockeamos useSearchParams para simular sin token
    vi.mocked(vi.importMock('react-router-dom')).useSearchParams.mockReturnValue([new URLSearchParams('')]);
    renderWithProviders(<ResetearContrasenaToken />);
    // Verificamos que aparezca el mensaje de error por enlace inválido
    expect(screen.getByText("Enlace inválido. Solicita un nuevo enlace de recuperación.")).toBeInTheDocument();
  });

  // Test: Verifica validación de contraseña (ej: menos de 8 caracteres)
  it("muestra error si la contraseña no cumple con los requisitos (menos de 8 caracteres)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    // Llenamos los campos con una contraseña inválida
    await user.type(screen.getByPlaceholderText(/nueva contraseña/i), "123"); // Contraseña corta
    await user.type(screen.getByPlaceholderText(/confirmar contraseña/i), "123");
    
    // Enviamos el formulario
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    // Verificamos que aparezca el error de validación
    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
  });

  // Test: Verifica error si las contraseñas no coinciden
  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    // Llenamos los campos con contraseñas que no coinciden
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Different123!");
    
    // Enviamos el formulario
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    // Verificamos que aparezca el error
    expect(screen.getByText("Las contraseñas no coinciden. Verifica e intenta de nuevo.")).toBeInTheDocument();
  });

  // Test: Verifica el estado de loading durante el envío
  it("muestra loading y deshabilita el botón durante el envío", async () => {
    // simular una respuesta exitosa
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    // Llenamos los campos con datos válidos
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    const submitButton = screen.getByRole("button", { name: /Actualizar contraseña/i });
    await user.click(submitButton);
    
    // Verificamos que el botón esté deshabilitado y muestre "Actualizando..."
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Actualizando...");
  });

  // Test: Verifica redirección exitosa a /login después de 3 segundos
  it("redirige a /login cuando se resetea exitosamente", async () => {
    // Mockeamos fetch para simular una respuesta exitosa
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    // Llenamos los campos con datos válidos
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    // Enviamos el formulario
    await user.click(screen.getByRole("button", { name: /actualizar contraseña/i }));
    
    // Verificamos que aparezca el mensaje de éxito
    expect(screen.getByText("¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...")).toBeInTheDocument();
    
    // Simulamos el paso del tiempo (3 segundos) y verificamos la redirección
    await new Promise(resolve => setTimeout(resolve, 3000));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // Test: Verifica error si la API falla
  it("muestra error si la API falla", async () => {
    // Mockeamos fetch para simular una respuesta de error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Token expirado" }),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<ResetearContrasenaToken />);
    
    // Llenamos los campos con datos válidos
    await user.type(screen.getByPlaceholderText(/Nueva contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/Confirmar contraseña/i), "Password123!");
    
    // Enviamos el formulario
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));
    
    // Verificamos que aparezca el error de la API
    expect(await screen.findByText("Token expirado")).toBeInTheDocument();
  });
});
