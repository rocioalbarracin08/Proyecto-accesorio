import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Importar contextos
import { AuthProvider } from "../contexts/AuthContext";
import { CarritoProvider } from "../contexts/CarritoContext";
import { PromocionesProvider } from "../contexts/PromocionesContext";

// Render helper con todos tus providers
export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <CarritoProvider>
          <PromocionesProvider>
            {children}
          </PromocionesProvider>
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
import { vi } from "vitest";
// Crear funciones mockeables para contextos
export const mockUseAuthContext = vi.fn(() => ({
  isLogged: false,
  logout: vi.fn(),
}));
export const mockUseCarrito = vi.fn(() => ({
  state: { totalItems: 0, showCarrito: false },
  toggleCarrito: vi.fn(),
  closeCarrito: vi.fn(),
}));

// En renderWithMockProviders
export function renderWithMockProviders(ui, { route = "/", ...options } = {}) {
  const MockAuthProvider = ({ children }) => {
    const mockValue = mockUseAuthContext();
    return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>;
  };

  const MockCarritoProvider = ({ children }) => {
    const mockValue = mockUseCarrito();
    return <CarritoContext.Provider value={mockValue}>{children}</CarritoContext.Provider>;
  };

  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <MockAuthProvider>
        <MockCarritoProvider>
          <PromocionesProvider>
            {children}
          </PromocionesProvider>
        </MockCarritoProvider>
      </MockAuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Importa AuthContext y CarritoContext en test-utils.jsx
import { AuthContext } from "../contexts/AuthContext";
import { CarritoContext } from "../contexts/CarritoContext";

// Reexporta todo lo útil de testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
