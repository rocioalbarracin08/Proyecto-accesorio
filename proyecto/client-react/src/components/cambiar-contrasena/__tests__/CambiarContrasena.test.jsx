import React from "react";
import { renderWithProviders, screen } from "@/test/test-utils.jsx"; //función personalizada para renderizar componentes dentro de los providers (por ejemplo: contextos, router) -> No seria necesario si no uso conxtetos y solo usaría render de @testing-library/react
import { describe, it, expect, vi } from "vitest";
//Sin esto no puedo correr los tests ni usar la funciones necesarias para test

import CambiarContrasena from "../CambiarContrasena"; //Objeto de prueba

vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: () => ({ logout: vi.fn() }),
}));

describe("CambiarContrasena Component", () => {
  it("renderiza el formulario de cambio de contraseña", () => {
    renderWithProviders(<CambiarContrasena />);
    expect(screen.getByPlaceholderText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Nueva Contraseña$/i)).toBeInTheDocument(); //Con los símbolos busca la coincidencia exacta con el nombre en el plaHolder
    expect(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar cambio/i })).toBeInTheDocument();
  });

  it("el botón de envío está habilitado inicialmente", () => {
    renderWithProviders(<CambiarContrasena />);
    const submitButton = screen.getByRole("button", { name: /confirmar cambio/i });
    expect(submitButton).not.toBeDisabled();
  });
});
