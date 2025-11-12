import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils.jsx"; //función personalizada para renderizar componentes dentro de los providers (por ejemplo: contextos, router) -> No seria necesario si no uso conxtetos y solo usaría render de @testing-library/react
//No recibe con @, ubicaciòn no aceptada por "no existir"
import { describe, it, expect, vi } from "vitest";
//Sin esto no puedo correr los tests ni usar la funciones necesarias para test
import userEvent from "@testing-library/user-event";  
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
  // Tests de validaciones de errores (reemplaza el test vacío con estos)----------------
  it("muestra error si la contraseña actual está vacía", async () => {
    const user = userEvent.setup();  // Inicializa userEvent
    renderWithProviders(<CambiarContrasena />);
    // Llena solo los campos de nueva contraseña (deja actual vacío)
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "nueva123");
    // Envía el formulario
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    // Verifica que aparezca el mensaje de error
    expect(screen.getByText("La contraseña actual es obligatoria.")).toBeInTheDocument();
  });
  //por nueva contraseña no ingresada 
  it("muestra error si la nueva contraseña está vacía", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CambiarContrasena />);
    // Llena contraseña actual y confirmar (deja nueva vacía)
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "confirm123");
    // Envía el formulario
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    // Verifica error
    expect(screen.getByText("La nueva contraseña es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error si la nueva contraseña tiene menos de 6 caracteres", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CambiarContrasena />);
    // Llena con contraseña corta
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "123");  // Menos de 6
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "123");
    // Envía el formulario
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    // Verifica error
    expect(screen.getByText("La nueva contraseña debe tener al menos 6 caracteres.")).toBeInTheDocument();
  });

  it("muestra error si las contraseñas nuevas no coinciden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CambiarContrasena />);
    // Llena con contraseñas que no coinciden
    await user.type(screen.getByPlaceholderText(/contraseña actual/i), "actual123");
    await user.type(screen.getByPlaceholderText(/^Nueva Contraseña$/i), "nueva123");
    await user.type(screen.getByPlaceholderText(/^Confirmar Nueva Contraseña$/i), "distinta123");
    // Envía el formulario
    await user.click(screen.getByRole("button", { name: /confirmar cambio/i }));
    // Verifica error
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });
});
