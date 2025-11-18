import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils";
import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import PerfilUser from "../PerfilUser";
import { useAuthContext } from "../../contexts/AuthContext";

// Mock useAuthContext
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("PerfilUser Component", () => {
  it("muestra 'Cargando perfil...' mientras se obtienen los datos", () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    renderWithProviders(<PerfilUser />);
    expect(screen.getByText(/cargando perfil/i)).toBeInTheDocument();
  });

  it("muestra los datos del usuario cuando fetch es exitoso", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithProviders(<PerfilUser />);
    expect(await screen.findByText(/rocío albarracín/i)).toBeInTheDocument();
    expect(screen.getByText(/género: femenino/i)).toBeInTheDocument();
    expect(screen.getByText(/email: rocio@example.com/i)).toBeInTheDocument();
  });

  it("muestra mensaje de error si la API devuelve error", async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    mockFetchError("Usuario no encontrado");
    renderWithProviders(<PerfilUser />);
    expect(await screen.findByText("Usuario no encontrado")).toBeInTheDocument();
  });

  it("muestra mensaje de error si fetch falla por red", async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    mockFetchNetworkError();
    renderWithProviders(<PerfilUser />);
    expect(await screen.findByText(/no se pudo obtener los datos del usuario/i)).toBeInTheDocument();
  });

  it("muestra botón 'Cambiar Contraseña' si está logueado", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithProviders(<PerfilUser />);
    expect(await screen.findByRole("button", { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it("no muestra botón 'Cambiar Contraseña' si no está logueado", async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithProviders(<PerfilUser />);
    await screen.findByText(/rocío albarracín/i);
    expect(screen.queryByRole("button", { name: /cambiar contraseña/i })).not.toBeInTheDocument();
  });

  it("navega a '/cambiar-contrasena' al hacer clic en 'Cambiar Contraseña'", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    const user = userEvent.setup();
    renderWithProviders(<PerfilUser />);
    const button = await screen.findByRole("button", { name: /cambiar contraseña/i });
    await user.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/cambiar-contrasena");
  });

  it("muestra opciones de Dueño si isOwner es true", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: true, userRole: "dueño" });
    mockFetchSuccess();
    renderWithProviders(<PerfilUser />);
    expect(await screen.findByText(/Opciones de Dueño/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrar Nuevo Empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión promociones/i)).toBeInTheDocument();
    expect(screen.getByText(/Editar destacados/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión Categorias/i)).toBeInTheDocument();
  });

  it("no muestra opciones de Dueño ni Empleado si no aplica", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });
    mockFetchSuccess();
    renderWithProviders(<PerfilUser />);
    await screen.findByText(/rocío albarracín/i);
    expect(screen.queryByText(/Opciones de Dueño/i)).not.toBeInTheDocument();
  });
});
