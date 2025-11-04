import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RecuperarContrasena from "../../components/recuperar-contrasena/RecuperarContrasena";

describe("RecuperarContrasena Component", () => {
  it("renders the password recovery form", () => {
    render(<RecuperarContrasena />);
    expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();
  });

  it("displays input fields for email", () => {
    render(<RecuperarContrasena />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });
});
