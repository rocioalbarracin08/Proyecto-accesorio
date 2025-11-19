import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Contexts falsos para los providers de prueba
const AuthContext = React.createContext();
const CarritoContext = React.createContext();
const PromocionesContext = React.createContext();

// Mocks exportables para controlar el comportamiento desde tests
export const mockUseAuthContext = vi.fn(() => ({
  isLogged: false,
  userRole: null, //Lo podemos modificar según nuestras necesidades
  authChecked: true,
  logout: vi.fn(),
}));

export const mockUseCarrito = vi.fn(() => ({
  state: { totalItems: 0, showCarrito: false },
  toggleCarrito: vi.fn(),
  closeCarrito: vi.fn(),
}));

export const mockUsePromociones = vi.fn(() => ({
  promociones: [],
  loading: false,
  error: null,
}));

// Re-exports comunes
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

// Render con providers reales (si los usas)
export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <div>{children}</div>
    </MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

// Render con providers mockeados (usa los mocks exportados arriba)
export function renderWithMockProviders(ui, { route = "/", ...options } = {}) {
  const MockAuthProvider = ({ children }) => (
    <AuthContext.Provider value={mockUseAuthContext()}>
      {children}
    </AuthContext.Provider>
  );

  const MockCarritoProvider = ({ children }) => (
    <CarritoContext.Provider value={mockUseCarrito()}>
      {children}
    </CarritoContext.Provider>
  );

  const MockPromocionesProvider = ({ children }) => (
    <PromocionesContext.Provider value={mockUsePromociones()}>
      {children}
    </PromocionesContext.Provider>
  );

  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <MockAuthProvider>
        <MockCarritoProvider>
          <MockPromocionesProvider>{children}</MockPromocionesProvider>
        </MockCarritoProvider>
      </MockAuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}