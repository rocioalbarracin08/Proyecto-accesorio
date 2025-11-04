import React from 'react';
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DiseñoMain from "../../components/diseño-main/DiseñoMain";

describe("DiseñoMain Component", () => {
  it("renders the main design section", () => {
    render(<DiseñoMain />);
    expect(screen.getByText(/diseño principal/i)).toBeInTheDocument();
  });

  it("displays the correct layout", () => {
    render(<DiseñoMain />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
