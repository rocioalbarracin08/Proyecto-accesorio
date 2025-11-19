import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithMockProviders, screen, mockUseAuthContext } from "../../../test/test-utils";
import userEvent from "@testing-library/user-event";
import PerfilUser from "../PerfilUser";

// Mock useAuthContext usando el de test-utils
vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

// Helpers para fetch
const mockUserData = {
  nombre: "Rocío",
  apellido: "Albarracín",
  genero: "Femenino",
  email: "rocio@example.com",
};

const mockFetchSuccess = () =>
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockUserData,
  });

const mockFetchError = (error) =>
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ error }),
  });

const mockFetchNetworkError = () =>
  global.fetch.mockRejectedValueOnce(new Error("Error de red"));

describe("PerfilUser Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configura mocks por defecto para AuthContext
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      isOwner: false,
      userRole: "cliente",
    });
    
    // Mock por defecto para fetch (perfil)
    global.fetch = vi.fn((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
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

  it("muestra 'Cargando perfil...' mientras se obtienen los datos", () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    renderWithMockProviders(<PerfilUser />);
    expect(screen.getByText(/cargando perfil/i)).toBeInTheDocument();
  });

  it("muestra los datos del usuario cuando fetch es exitoso", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithMockProviders(<PerfilUser />);
    expect(await screen.findByText(/rocío albarracín/i)).toBeInTheDocument();
    expect(screen.getByText(/género: femenino/i)).toBeInTheDocument();
    expect(screen.getByText(/email: rocio@example.com/i)).toBeInTheDocument();
  });

  it("muestra mensaje de error si la API devuelve error", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    mockFetchError("Usuario no encontrado");
    renderWithMockProviders(<PerfilUser />);
    expect(await screen.findByText("Usuario no encontrado")).toBeInTheDocument();
  });

  it("muestra mensaje de error si fetch falla por red", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    mockFetchNetworkError();
    renderWithMockProviders(<PerfilUser />);
    expect(await screen.findByText(/no se pudo obtener los datos del usuario/i)).toBeInTheDocument();
  });

  it("muestra botón 'Cambiar Contraseña' si está logueado", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithMockProviders(<PerfilUser />);
    expect(await screen.findByRole("button", { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it("no muestra botón 'Cambiar Contraseña' si no está logueado", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithMockProviders(<PerfilUser />);
    await screen.findByText(/rocío albarracín/i);
    expect(screen.queryByRole("button", { name: /cambiar contraseña/i })).not.toBeInTheDocument();
  });

  it("navega a '/cambiar-contrasena' al hacer clic en 'Cambiar Contraseña'", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    const user = userEvent.setup();
    renderWithMockProviders(<PerfilUser />);
    const button = await screen.findByRole("button", { name: /cambiar contraseña/i });
    await user.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/cambiar-contrasena");
  });

  it("muestra opciones de Dueño si isOwner es true", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: true, isOwner: true, userRole: "dueño" });
    mockFetchSuccess();
    renderWithMockProviders(<PerfilUser />);
    expect(await screen.findByText(/Opciones de Dueño/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrar Nuevo Empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión promociones/i)).toBeInTheDocument();
    expect(screen.getByText(/Editar destacados/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión Categorias/i)).toBeInTheDocument();
  });

  it("no muestra opciones de Dueño ni Empleado si no aplica", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithMockProviders(<PerfilUser />);
    await screen.findByText(/rocío albarracín/i);
    expect(screen.queryByText(/Opciones de Dueño/i)).not.toBeInTheDocument();
  });
});