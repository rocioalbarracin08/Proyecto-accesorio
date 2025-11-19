import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithMockProviders, screen, userEvent, waitFor, mockUseAuthContext, mockUseCarrito } from "../../../test/test-utils";
import { BarraNavegacion } from "../Navegacion";

const mockNavigate = vi.fn();  // Define el mock fuera para poder accederlo en tests

// Mocks para los contextos (necesarios para que el componente use los mocks en lugar de los hooks reales)
vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext,
}));

vi.mock("../../../contexts/CarritoContext", () => ({
  useCarrito: mockUseCarrito,
}));

// Mock de react-router-dom (necesario porque el componente usa useNavigate y Link)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,  // Usa el mockNavigate definido fuera
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

describe("BarraNavegacion - Categorías en Tienda", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configura mocks por defecto para AuthContext
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      userRole: null,
      authChecked: true,
      logout: vi.fn(),
    });
    
    // Configura mocks por defecto para CarritoContext (por consistencia, aunque no se use directamente)
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
    
    // Mock por defecto para fetch (categorías)
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([]),  // Devuelve array vacío por defecto
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra categorías en el submenu de 'Tienda'", async () => {
    // Mockea fetch para devolver categorías
    const mockCategorias = [
      { id_category: 1, categoria: "Electrónica" },
      { id_category: 2, categoria: "Ropa" },
    ];
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategorias,  // Devuelve el array de categorías
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Espera que se carguen categorías
    await waitFor(() => {
      expect(screen.getByText("Electrónica")).toBeInTheDocument();
      expect(screen.getByText("Ropa")).toBeInTheDocument();
    });
  });

  it("navega a la página de categoría al hacer click en una", async () => {
    const user = userEvent.setup();
    
    const mockCategorias = [{ id_category: 1, categoria: "Electrónica" }];
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategorias,  // Devuelve el array de categorías
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Espera y haz click en una categoría
    await waitFor(() => screen.getByText("Electrónica"));
    await user.click(screen.getByText("Electrónica"));
    
    // useNavigate DEBE SER llamado con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith("/productos/1");
  });
});