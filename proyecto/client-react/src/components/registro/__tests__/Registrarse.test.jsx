import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import { Registrarse } from "../Registrarse";

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

describe("Registrarse Component", () => {
  it("Renderiza el título y el botón", () => {
    renderWithProviders(<Registrarse />);
    expect(screen.getByText(/registrarse/i)).toBeInTheDocument();
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
});
