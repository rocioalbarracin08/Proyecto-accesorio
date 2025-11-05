import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PerfilUser from "../PerfilUser";

// 🧩 Mock del contexto de autenticación
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importamos la función mockeada para poder cambiar sus valores por test
import { useAuthContext } from "../../contexts/AuthContext";

describe("PerfilUser Component", () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Limpia mocks antes de cada test
    vi.restoreAllMocks(); // Restaura fetch simulado
  });

  // 🧪 Caso 1: muestra mensaje de carga al inicio
  it("muestra 'Cargando perfil...' mientras se obtienen los datos", () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });

    //MemoryRouter es un router ligero para testing, que no cambia la URL real. Es más rápido y controlable que BrowserRouter
    render(
      <MemoryRouter>
        <PerfilUser />
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando perfil/i)).toBeInTheDocument();
  });

  // 🧪 Caso 2: muestra datos del usuario correctamente
  it("muestra los datos del usuario cuando el fetch es exitoso", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });

    // Mock del fetch con datos válidos
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    render(
      <MemoryRouter>
        <PerfilUser />
      </MemoryRouter>
    );

    // Espera que se rendericen los datos después del fetch
    expect(await screen.findByText(/rocío albarracín/i)).toBeInTheDocument();
    expect(screen.getByText(/femenino/i)).toBeInTheDocument();
    expect(screen.getByText(/rocio@example.com/i)).toBeInTheDocument();
  });

  // 🧪 Caso 3: muestra mensaje de error si el fetch falla
  it("muestra mensaje de error si el fetch falla", async () => {
    useAuthContext.mockReturnValue({ isLogged: false, isOwner: false, userRole: "cliente" });

    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Error de red"));

    render(
      <MemoryRouter>
        <PerfilUser />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no se pudo obtener los datos del usuario/i)).toBeInTheDocument();
  });

  // 🧪 Caso 4: muestra botón "Cambiar Contraseña" solo si está logueado
  it('muestra el botón "Cambiar Contraseña" si el usuario está logueado', async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "cliente" });

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    render(
      <MemoryRouter>
        <PerfilUser />
      </MemoryRouter>
    );

    expect(await screen.findByRole("button", { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  // 🧪 Caso 5: muestra opciones de dueño
  it("muestra opciones de dueño si isOwner es true", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: true, userRole: "dueño" });

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    render(
      <MemoryRouter>
        <PerfilUser />
      </MemoryRouter>
    );

    expect(await screen.findByText(/opciones de dueño/i)).toBeInTheDocument();
    expect(screen.getByText(/registrar nuevo empleado/i)).toBeInTheDocument();
  });

  // 🧪 Caso 6: muestra opciones de empleado
  it("muestra opciones de empleado si el rol es 'empleado'", async () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false, userRole: "empleado" });

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => ({
        nombre: "Rocío",
        apellido: "Albarracín",
        genero: "Femenino",
        email: "rocio@example.com",
      }),
    });

    render(
      <MemoryRouter>
        <PerfilUser />
      </MemoryRouter>
    );

    expect(await screen.findByText(/opciones de empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard de empleado/i)).toBeInTheDocument();
  });
});
