import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// --------- CONTEXTOS MOCKEADOS DIRECTAMENTE (sin importar nada real) ---------
const AuthContext = React.createContext();
const CarritoContext = React.createContext();
const PromocionesContext = React.createContext();

// --------- HOOKS QUE MOCKEÁS (solo para renderWithProviders) ---------
vi.mock("../../hooks/useAuth", () => ({
  default: () => ({
    usuarioName: "",
    setUsuarioName: vi.fn(),
    usuarioApellido: "",
    setUsuarioApellido: vi.fn(),
    email: "",
    setEmail: vi.fn(),
    contraseña: "",
    setContraseña: vi.fn(),
    repetirContraseña: "",
    setRepetirContraseña: vi.fn(),
    error: "",
    setError: vi.fn(),
  }),
}));

// --------- RENDER CON PROVIDERS REALES (usa hooks mockeados) ---------
export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <div>{children}</div> 
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// --------- MOCKS DE CONTEXTOS (para renderWithMockProviders) ----------
export const mockUseAuthContext = vi.fn(() => ({
  isLogged: false,
  userRole: null,
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

// --------- RENDER CON PROVIDERS MOCKEADOS (todo mockeado) ---------
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
// --------- REEXPORTS ---------
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";  // Mantén si quieres, pero considera cambiar a exports explícitos si causa errores
export { default as userEvent } from "@testing-library/user-event";