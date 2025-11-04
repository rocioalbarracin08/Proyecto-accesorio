import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ResetearContrasenaToken from "../../components/resetear-contrasena/ResetearContrasenaToken";

describe("ResetearContrasenaToken Component", () => {
  it("renders the password reset form", () => {
    render(<ResetearContrasenaToken />);
    expect(screen.getByText(/restablecer contraseña/i)).toBeInTheDocument();
  });

  it("displays input fields for new password", () => {
    render(<ResetearContrasenaToken />);
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /restablecer/i })
    ).toBeInTheDocument();
  });
});
