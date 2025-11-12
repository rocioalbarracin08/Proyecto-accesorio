import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir todos los providers (como AuthProvider y MemoryRouter)
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para simular interacciones del usuario
import PerfilUser from "../PerfilUser"; // Importamos el componente a testear

// Mockeamos useAuthContext para controlar el estado de autenticación
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importamos la función mockeada para poder cambiar sus valores por test
import { useAuthContext } from "../../contexts/AuthContext";

// Mockeamos useNavigate para controlar la navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos fetch globalmente para controlar las llamadas a la API
global.fetch = vi.fn();

describe("PerfilUser Component", () => {
  // Limpiamos los mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test: Muestra mensaje de carga al inicio
  it("muestra 'Cargando perfil...' mientras se obtienen los datos", () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });

    renderWithProviders(<PerfilUser />);

    // Verificamos que aparezca el mensaje de carga inicialmente
    expect(screen.getByText(/cargando perfil/i)).toBeInTheDocument();
  });

  // Test: Muestra datos del usuario cuando el fetch es exitoso
  it("muestra los datos del usuario cuando el fetch es exitoso", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch con datos válidos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    renderWithProviders(<PerfilUser />);

    // Esperamos que se rendericen los datos después del fetch
    expect(await screen.findByText(/rocío albarracín/i)).toBeInTheDocument();
    expect(screen.getByText(/femenino/i)).toBeInTheDocument();
    expect(screen.getByText(/rocio@example.com/i)).toBeInTheDocument();
  });

  // Test: Muestra mensaje de error si el fetch falla (error de red)
  it("muestra mensaje de error si el fetch falla por red", async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch para simular error de red
    global.fetch.mockRejectedValueOnce(new Error("Error de red"));

    renderWithProviders(<PerfilUser />);

    // Verificamos que aparezca el mensaje de error
    expect(await screen.findByText(/no se pudo obtener los datos del usuario/i)).toBeInTheDocument();
  });

  // Test: Muestra mensaje de error si la API devuelve error
  it("muestra mensaje de error si la API devuelve un error", async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch con respuesta de error de la API
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ error: "Usuario no encontrado" }),
    });

    renderWithProviders(<PerfilUser />);

    // Verificamos que aparezca el error de la API
    expect(await screen.findByText("Usuario no encontrado")).toBeInTheDocument();
  });

  // Test: Muestra botón "Cambiar Contraseña" solo si está logueado
  it('muestra el botón "Cambiar Contraseña" si el usuario está logueado', async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch con datos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    renderWithProviders(<PerfilUser />);

    // Verificamos que aparezca el botón
    expect(await screen.findByRole("button", { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  // Test: No muestra botón "Cambiar Contraseña" si no está logueado
  it('no muestra el botón "Cambiar Contraseña" si el usuario no está logueado', async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch con datos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    renderWithProviders(<PerfilUser />);

    // Esperamos a que cargue y verificamos que el botón no esté presente
    await screen.findByText(/rocío albarracín/i); // Espera a que cargue
    expect(screen.queryByRole("button", { name: /cambiar contraseña/i })).not.toBeInTheDocument();
  });

  // Test: Navega a "/cambiar-contrasena" al hacer clic en el botón
  it('navega a "/cambiar-contrasena" al hacer clic en "Cambiar Contraseña"', async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch con datos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    const user = userEvent.setup();
    renderWithProviders(<PerfilUser />);

    // Esperamos al botón y lo clicamos
    const button = await screen.findByRole("button", { name: /cambiar contraseña/i });
    await user.click(button);

    // Verificamos que navigate haya sido llamado con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith("/cambiar-contrasena");
  });

  // Test: Muestra opciones de dueño si isOwner es true
  it("muestra opciones de dueño si isOwner es true", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: true, userRole: "dueño" });

    // Mockeamos fetch con datos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    renderWithProviders(<PerfilUser />);

    // Verificamos que aparezcan las opciones de dueño
    expect(await screen.findByText(/opciones de dueño/i)).toBeInTheDocument();
    expect(screen.getByText(/registrar nuevo empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/gestión promociones/i)).toBeInTheDocument();
    expect(screen.getByText(/editar destacados/i)).toBeInTheDocument();
    expect(screen.getByText(/gestión categorias/i)).toBeInTheDocument();
  });

  // Test: Muestra opciones de empleado si el rol es 'empleado'
  it("muestra opciones de empleado si el rol es 'empleado'", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "empleado" });

    // Mockeamos fetch con datos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    renderWithProviders(<PerfilUser />);

    // Verificamos que aparezcan las opciones de empleado
    expect(await screen.findByText(/opciones de empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard de empleado/i)).toBeInTheDocument();
  });

  // Test: No muestra opciones de dueño ni empleado si no aplica
  it("no muestra opciones de dueño ni empleado si no es owner ni empleado", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });

    // Mockeamos fetch con datos
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    renderWithProviders(<PerfilUser />);

    // Esperamos a que cargue y verificamos que no aparezcan las secciones
    await screen.findByText(/rocío albarracín/i);
    expect(screen.queryByText(/opciones de dueño/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/opciones de empleado/i)).not.toBeInTheDocument();
  });
});