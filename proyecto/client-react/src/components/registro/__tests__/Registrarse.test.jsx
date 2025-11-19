import React from "react";
import { renderWithProviders, screen, waitFor } from "../../../test/test-utils";  // Asegúrate de la ruta
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Registrarse } from "../Registrarse";

// Mockea useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});



describe("Registrarse Component", () => {

  // Setup global antes de cada test
  beforeEach(() => {
    // Mock fetch global por defecto (para AuthContext y otros)
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),  // Resuelve a un objeto vacío
      })
    );
    vi.clearAllMocks();  // Limpia mocks previos
  });
  // Cleanup después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });
  it("Renderiza el título y el botón", () => {
    renderWithProviders(<Registrarse />);
    expect(screen.getAllByText(/registrarse/i).length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
  });

  it("Muestra los campos de entrada principales", () => {
    renderWithProviders(<Registrarse />);
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cree una contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repita la contraseña/i)).toBeInTheDocument();
  });

  it("muestra error si el nombre está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    // Llena otros campos, deja nombre vacío
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    });
  });

  // Repite el patrón para otros tests de validación (apellido, email, etc.)
  it("muestra error si el apellido está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("El apellido es obligatorio.")).toBeInTheDocument();
    });
  });

  it("muestra error si el email está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("El email es obligatorio.")).toBeInTheDocument();
    });
  });

  it("muestra error si el email no es válido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "invalid-email");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Ingresa un email válido (ej: usuario@dominio.com).")).toBeInTheDocument();
    });
  });

  it("muestra error si la contraseña está vacía", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    });
  });

  it("muestra error si la contraseña no cumple con los requisitos (ej: menos de 8 caracteres)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "123");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "123");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
    });
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Different123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    });
  });

  it("muestra indicador de fortaleza de contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    const passwordInput = screen.getByPlaceholderText(/cree una contraseña/i);
    await user.type(passwordInput, "Password123!");
    
    expect(screen.getByText("Fortaleza: Fuerte")).toBeInTheDocument();
  });

  it("cambia el género al hacer clic en los botones", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    const masculinoButton = screen.getByRole("button", { name: /masculino/i });
    const femeninoButton = screen.getByRole("button", { name: /femenino/i });
    
    expect(femeninoButton).toHaveClass("F");/*Antes era "active" */
    expect(masculinoButton).not.toHaveClass("F");
    
    await user.click(masculinoButton);
    expect(masculinoButton).toHaveClass("active");
    expect(femeninoButton).not.toHaveClass("active");
  });

  /*it("muestra loading y deshabilita el botón durante el envío", async () => {
    // Mock fetch para éxito (resuelve inmediatamente)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");

    const Button = screen.getByRole("button", { name: /Registrarse/i });
    await user.click(Button);
    console.log("Button after click:", Button.disabled);  // Debería ser true
    
    expect(Button).toBeDisabled();
    expect(Button).toHaveTextContent("Registrando...");
    await waitFor(() => {
      expect(Button).not.toBeDisabled();
      expect(Button).toHaveTextContent("Registrarse");
    });
  });*/

it("Muestra error si la API devuelve error", async () => {
  // Mock fetch para error usando vi.fn (sintaxis de Vitest)
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: async () => ({ error: "Usuario ya existe" }),
    })
  );

  const user = userEvent.setup();
  renderWithProviders(<Registrarse />);

  await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
  await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
  await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
  await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
  await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");

  // Selecciona género para pasar la validación
  await user.click(screen.getByRole("button", { name: /masculino/i }));

  // Haz click en submit UNA vez
  await user.click(screen.getByRole("button", { name: /registrarse/i }));

  // Espera el error específico
  await waitFor(() => {
    expect(screen.getByText("Usuario ya existe"||"Error en el registro. Inténtalo de nuevo.")).toBeInTheDocument();
  });
});

  it("Redirige a /login en registro exitoso", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    // Selecciona género para pasar la validación
    await user.click(screen.getByRole("button", { name: /masculino/i }));
    await user.click(screen.getByRole("button", { name: /registrarse/i }));

    // Espera a que navigate se llame con "/login"
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});