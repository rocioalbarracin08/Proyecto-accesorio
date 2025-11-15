import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuthContext } from "../AuthContext";
import { describe, it, expect, vi } from "vitest";

// Componente de prueba que usa el contexto
function TestComponent() {
  const { isLogged, login, logout } = useAuthContext();
  return (
    <>
      <p>Logged: {isLogged ? "Yes" : "No"}</p>
      <button onClick={login}>Login</button>
      <button onClick={logout}>Logout</button>
    </>
  );
}

describe("AuthContext", () => {
  // Mock fetch global para evitar llamadas reales
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false, // Simula no logueado inicialmente
        json: async () => ({}),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders and provides default context values", async () => {
    render(
      <MemoryRouter> {/* Envuelve en MemoryRouter */}
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Espera a que authChecked sea true (después del fetch)
    await waitFor(() => {
      expect(screen.getByText(/logged: no/i)).toBeInTheDocument();
    });
  });

  // Test adicional: Verifica login simulado
  it("updates isLogged after login", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id_cliente: 1 }), // Simula logueado como cliente
      })
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Espera a que se actualice
    await waitFor(() => {
      expect(screen.getByText(/logged: yes/i)).toBeInTheDocument();
    });
  });
});
