import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithMockProviders, screen, mockUseAuthContext, mockUseCarrito } from "../../../test/test-utils"; // Usa helpers y mocks
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

// Mock de react-router-dom (necesario porque el componente usa useNavigate y Link)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),  // Mock básico para useNavigate
    Link: ({ to, children }) => <a href={to}>{children}</a>,  // Mock simple para Link
  };
});

describe("BarraNavegacion - Submenu + INFO (Nosotros)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configura mocks por defecto para AuthContext (ajusta según necesidades del test)
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      userRole: null,
      authChecked: true,
      logout: vi.fn(),
    });
    
    // Configura mocks por defecto para CarritoContext
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
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

  it("muestra el enlace 'Nosotros' en el submenu", () => {
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica que aparezca en el submenu
    expect(screen.getByRole("link", { name: /Nosotros/i })).toBeInTheDocument();
  });

  it("muestra el enlace 'Preguntas de clientes' en el submenu", () => {
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica que aparezca
    expect(screen.getByRole("link", { name: /Preguntas de clientes/i })).toBeInTheDocument();
  });

  it("el enlace '+ INFO' lleva a '/nosotros'", () => {
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica href
    const infoLink = screen.getByRole("link", { name: /\+ INFO/i });
    expect(infoLink).toHaveAttribute("href", "/nosotros");
  });
});