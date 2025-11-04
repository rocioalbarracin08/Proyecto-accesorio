import React from 'react';
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DashboardEmpleado from "../../components/empleados/DashboardEmpleado";

describe("DashboardEmpleado Component", () => {
  it("renders the employee dashboard", () => {
    render(<DashboardEmpleado />);
    expect(
      screen.getByText(/bienvenido al dashboard de empleados/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /agregar empleado/i })
    ).toBeInTheDocument();
  });

  it("displays a list of employees", () => {
    render(<DashboardEmpleado />);
    expect(screen.getByText(/lista de empleados/i)).toBeInTheDocument();
  });
});
