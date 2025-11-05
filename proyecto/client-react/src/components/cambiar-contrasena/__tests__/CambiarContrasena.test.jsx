import { renderWithProviders, screen } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import CambiarContrasena from "../CambiarContrasena";

vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: () => ({ logout: vi.fn() }),
}));

describe("CambiarContrasena Component", () => {
  it("renderiza el formulario de cambio de contraseña", () => {
    renderWithProviders(<CambiarContrasena />);
    expect(screen.getByPlaceholderText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirmar nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar cambio/i })).toBeInTheDocument();
  });

  it("el botón de envío está habilitado inicialmente", () => {
    renderWithProviders(<CambiarContrasena />);
    const submitButton = screen.getByRole("button", { name: /confirmar cambio/i });
    expect(submitButton).not.toBeDisabled();
  });
});
