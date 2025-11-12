import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Asegúrate de que la ruta sea correcta; si usas alias @, verifica que funcione en tests (puede que necesites rutas relativas si el alias no se aplica en Vitest)
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Importa userEvent para simular interacciones del usuario
import { Registrarse } from "../Registrarse"; // Asegúrate de que la ruta al componente sea correcta

// Mockea el hook useAuth para evitar dependencias externas
vi.mock("../../hooks/useAuth", () => ({
  default: () => ({
    usuarioName: "",
    setUsuarioName: vi.fn(),
    usuarioApellido: "",
    setUsuarioApellido: vi.fn(),
    email: "",
    setEmail: vi.fn(),
    contraseña: "",
    setContraseña: vi.fn(),
    repetirContraseña: "",
    setRepetirContraseña: vi.fn(),
    error: "",
    setError: vi.fn(),
  }),
}));

// Mockea fetch globalmente para evitar llamadas reales al back
global.fetch = vi.fn();

// Mockea useNavigate para controlar la navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe("Registrarse Component", () => {
  // Limpia mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza el título y el botón", () => {
    renderWithProviders(<Registrarse />);
    expect(screen.getByText(/registrarse/i)).toBeInTheDocument(); // Encuentra el <h1>Registrarse</h1>
    expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument(); // Encuentra el botón con texto "Registrarse"
  });

  it("Muestra los campos de entrada principales", () => {
    renderWithProviders(<Registrarse />);
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cree una contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repita la contraseña/i)).toBeInTheDocument();
  });

  // Nuevos tests de interacción y validación (inspirados en tu test exitoso de CambiarContrasena)
  it("muestra error si el nombre está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    // Llena algunos campos pero deja nombre vacío
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    // Hace clic en el botón de registro
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    // Verifica que aparezca el mensaje de error
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
  });

  it("muestra error si el apellido está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    expect(screen.getByText("El apellido es obligatorio.")).toBeInTheDocument();
  });

  it("muestra error si el email está vacío al enviar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    expect(screen.getByText("El email es obligatorio.")).toBeInTheDocument();
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
    
    expect(screen.getByText("Ingresa un email válido (ej: usuario@dominio.com).")).toBeInTheDocument();
  });

  it("muestra error si la contraseña está vacía", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error si la contraseña no cumple con los requisitos (ej: menos de 8 caracteres)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "123"); // Contraseña inválida
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "123");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
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
    
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("muestra indicador de fortaleza de contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    const passwordInput = screen.getByPlaceholderText(/cree una contraseña/i);
    await user.type(passwordInput, "Password123!");
    
    // Verifica que aparezca el indicador de fortaleza
    expect(screen.getByText("Fortaleza: Fuerte")).toBeInTheDocument();
  });

  it("cambia el género al hacer clic en los botones", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    const masculinoButton = screen.getByRole("button", { name: /masculino/i });
    const femeninoButton = screen.getByRole("button", { name: /femenino/i });
    
    // Inicialmente, femenino debería estar activo (por defecto "F")
    expect(femeninoButton).toHaveClass("active");
    expect(masculinoButton).not.toHaveClass("active");
    
    // Hace clic en masculino
    await user.click(masculinoButton);
    expect(masculinoButton).toHaveClass("active");
    expect(femeninoButton).not.toHaveClass("active");
  });

  it("muestra loading y deshabilita el botón durante el envío", async () => {
    // Mockea fetch para simular una respuesta exitosa
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    const submitButton = screen.getByRole("button", { name: /registrarse/i });
    await user.click(submitButton);
    
    // Verifica que el botón esté deshabilitado y muestre "Registrando..."
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Registrando...");
  });

  // Test para error en la db (simula respuesta no ok)
  it("muestra error si la db tira error", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Usuario ya existe" }),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<Registrarse />);
    
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    // Espera a que aparezca el error (usa waitFor si es necesario, pero aquí debería ser síncrono)
    expect(await screen.findByText("Usuario ya existe")).toBeInTheDocument();
  });

  it("Redirección a login", async()=>{
    //Mockeo fetch para simular respuesta exitosa
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json:async()=>({})
    })
    const user = userEvent.setup()
    renderWithProviders(<Registrarse/>)
    // Llena todos los campos requeridos
    await user.type(screen.getByPlaceholderText(/nombre/i), "Nombre");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Apellido");
    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.type(screen.getByPlaceholderText(/repita la contraseña/i), "Password123!");
    
    // Hace clic en el botón de registro
    await user.click(screen.getByRole("button", { name: /registrarse/i }));
    
    // Verifica que navigate haya sido llamado con "/login"
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  })
});
