import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RegistrarEmpleados from "../../components/empleados/RegistrarEmpleados";

describe("RegistrarEmpleados Component", () => {
  it("renders the employee registration form", () => {
    render(<RegistrarEmpleados />);
    expect(screen.getByLabelText(/nombre del empleado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registrar empleado/i })
    ).toBeInTheDocument();
  });

  it("disables the submit button if required fields are empty", () => {
    render(<RegistrarEmpleados />);
    const submitButton = screen.getByRole("button", {
      name: /registrar empleado/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
