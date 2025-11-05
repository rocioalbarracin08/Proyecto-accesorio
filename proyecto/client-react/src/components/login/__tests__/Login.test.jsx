import React from "react";
import { renderWithProviders, screen, fireEvent } from "../../../test/test-utils";
import { vi, describe, it, expect } from "vitest";
import { Login } from "../Login";

vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: () => ({ login: vi.fn() }),
}));

describe("Login Component", () => {
  it("Renderiza formulario y botón", () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("Muestra error si email o contraseña están vacíos al hacer click", () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    expect(screen.getByText(/por favor, complete todos los campos/i)).toBeInTheDocument();
  });
});
