import React from "react";
import { renderWithMockProviders, screen, userEvent, waitFor, mockUseAuthContext } from "../../../test/test-utils"; 
import { vi, describe, it, beforeEach } from "vitest";
import { Login } from "../Login";

// Mocks observables
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

// Mock de react-router-dom (useNavigate + Link sencilla)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
}); //LO USO PARA EL TEST LLAMA LOGIN Y NAVEGA

vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext, // O la forma en que el hook esté expuesto
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Sobrescribimos el mock de useAuthContext para que login sea observable
    // mockUseAuthContext viene de test-utils; lo configuramos aquí
    mockUseAuthContext.mockReturnValue({ 
      login: mockLogin,  // Función mockeada para verificar llamadas
      logout: vi.fn(), 
      isLogged: false,
      userRole: null,  // Agregado por si el componente lo usa
      authChecked: true  // Agregado por consistencia
    });

    // Mock global para fetch (neutro por defecto; tests lo sobrescriben si necesitan)
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );
  });

  it("renderiza inputs y botón", () => {
    renderWithMockProviders(<Login />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("muestra mensaje de error si email o contraseña están vacíos al hacer click", async () => {
    renderWithMockProviders(<Login />);
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/por favor, complete todos los campos/i)).toBeInTheDocument();
    });
  });

  it("muestra error cuando la API responde contraseña incorrecta", async () => {
    // Sobrescribimos fetch para simular error de contraseña
    global.fetch = vi.fn((url) => {
      if (String(url).includes("/usuarios/login")) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: "La contraseña es incorrecta" }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    renderWithMockProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@mail.com");
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument();
    });
  });

  it("muestra error cuando la petición falla (network error)", async () => {
    // Sobrescribimos fetch para simular error de red
    global.fetch = vi.fn((url) => {
      if (String(url).includes("/usuarios/login")) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    renderWithMockProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@mail.com");
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), "123456");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/error de conexión con el servidor/i)).toBeInTheDocument();
    });
  });

  it("llama a login() y navega a / cuando el login es exitoso", async () => {
    // **1. Asegurar el mock del Contexto Observable para este test**
    mockUseAuthContext.mockReturnValue({ 
      login: mockLogin, // <-- Aseguramos que mockLogin se use
      logout: vi.fn(), 
      isLogged: false,
      userRole: null,  
      authChecked: true 
    });
    
    // 2. Sobrescribimos fetch para simular éxito
    global.fetch = vi.fn((url) => {
      if (String(url).includes("/usuarios/login")) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    renderWithMockProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), "ok@mail.com");
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), "correctpass");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled(); 
      expect(mockNavigate).toHaveBeenCalledWith("/");  
    });
  });
});