import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RecuperarContrasena from "../RecuperarContrasena";

// 🧩 Mock global de fetch
global.fetch = vi.fn();

describe("RecuperarContrasena Component", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpia mocks entre tests
  });

  it("renderiza correctamente el formulario", () => {
    render(
      <MemoryRouter>
        <RecuperarContrasena />
      </MemoryRouter>
    );

    expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tu email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar email/i })).toBeInTheDocument();
  });

  it("muestra error si se envía un email inválido", async () => {
    render(
      <MemoryRouter>
        <RecuperarContrasena />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/tu email/i);
    const button = screen.getByRole("button", { name: /enviar email/i });

    fireEvent.change(input, { target: { value: "correo-invalido" } });
    fireEvent.click(button);

    expect(await screen.findByText(/por favor, ingresa un email válido/i)).toBeInTheDocument();
  });

  it("muestra mensaje de éxito si el fetch es correcto", async () => {
    // 🧠 Mock del fetch exitoso
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reset_url: "http://localhost:5000/reset/abc123" }),
    });

    render(
      <MemoryRouter>
        <RecuperarContrasena />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/tu email/i);
    const button = screen.getByRole("button", { name: /enviar email/i });

    fireEvent.change(input, { target: { value: "usuario@correo.com" } });
    fireEvent.click(button);

    // Esperamos a que aparezca el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText(/email enviado/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /ir a resetear contraseña/i })).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error si el fetch falla", async () => {
    // 🧠 Mock del fetch con error
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Usuario no encontrado." }),
    });

    render(
      <MemoryRouter>
        <RecuperarContrasena />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/tu email/i);
    const button = screen.getByRole("button", { name: /enviar email/i });

    fireEvent.change(input, { target: { value: "noexiste@correo.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/usuario no encontrado/i)).toBeInTheDocument();
    });
  });
});
