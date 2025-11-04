import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Registrarse from "../../components/registro/Registrarse";

describe("Registrarse Component", () => {
  it("renders the registration form", () => {
    render(<Registrarse />);
    expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
  });

  it("displays input fields for user details", () => {
    render(<Registrarse />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registrarse/i })
    ).toBeInTheDocument();
  });
});
