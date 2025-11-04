import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import { Login } from "../../components/login/Login";

// Mock del contexto de autenticación
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ login: vi.fn(), user: null }),
}));

describe("Login Component", () => {
  it("renders the login form", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it("shows an error message on invalid login", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
    loginButton.click();
    expect(
      await screen.findByText(/credenciales inválidas/i)
    ).toBeInTheDocument();
  });

  it("Renderiza formulario y botón", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it("Muestra error si email o contraseña están vacíos al hacer click", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      screen.queryByText(/por favor, complete todos los campos/i)
    ).toBeInTheDocument();
  });
});
