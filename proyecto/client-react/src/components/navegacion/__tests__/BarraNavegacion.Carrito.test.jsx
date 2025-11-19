import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithMockProviders, screen, userEvent, mockUseAuthContext, mockUseCarrito } from "../../../test/test-utils";
import { BarraNavegacion } from "../Navegacion";

// Mocks para los contextos (necesarios para que el componente use los mocks en lugar de los hooks reales)
vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext,
}));

vi.mock("../../../contexts/CarritoContext", () => ({
  useCarrito: mockUseCarrito,
}));

// Si CarruselPromociones usa PromocionesContext, mockéalo también (aunque no se use directamente en BarraNavegacion)
vi.mock("../../../contexts/PromocionesContext", () => ({
  usePromociones: () => ({
    promociones: [],
    loading: false,
    error: null,
  }),
}));

describe("BarraNavegacion - Botón Carrito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configura mocks por defecto para AuthContext (ajusta según necesidades del test)
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      userRole: null,
      authChecked: true,
      logout: vi.fn(),
    });
    
    // Mock fetch para evitar llamadas reales (perfil y categorías)
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => ({}),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el contador de items en el carrito", () => {
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 5, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
    
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica contador (el span con class "carrito-count")
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("llama a toggleCarrito al hacer click en el botón", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();

    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: mockToggle,
      closeCarrito: vi.fn(),
    });

    // Mock fetch para cubrir perfil y categorías (devuelve datos vacíos o básicos para evitar errores)
    global.fetch = vi.fn((url) => {
      if (url.includes("/usuarios/perfil")) {
        return Promise.resolve({ json: async () => ({ nombre: "Usuario" }) });
      }
      if (url.includes("/categoria/")) {
        return Promise.resolve({ json: async () => [] });  // Categorías vacías
      }
      return Promise.resolve({ json: async () => ({}) });
    });
    renderWithMockProviders(<BarraNavegacion />);
    
    // Cambia el selector: usar getByAltText para la imagen dentro del botón (más confiable que el aria-label dinámico)
    const carritoButton = screen.getByAltText("Ícono de carrito de compras");
    await user.click(carritoButton);
    
    
    // Verifica que se llame a toggle
    expect(mockToggle).toHaveBeenCalled();
  });
});