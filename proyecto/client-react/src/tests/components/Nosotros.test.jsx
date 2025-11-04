import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Nosotros from "../../components/infoCompany/Nosotros";

describe("Nosotros Component", () => {
  it("renders the about us section", () => {
    render(<Nosotros />);
    expect(screen.getByText(/sobre nosotros/i)).toBeInTheDocument();
  });

  it("displays the company information", () => {
    render(<Nosotros />);
    expect(screen.getByText(/nuestra misión/i)).toBeInTheDocument();
    expect(screen.getByText(/nuestra visión/i)).toBeInTheDocument();
  });
});
