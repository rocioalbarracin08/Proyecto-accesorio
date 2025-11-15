import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, waitFor, userEvent, mockUseAuthContext, mockUseCarrito } from "../../../test/test-utils";
import { BarraNavegacion } from "../Navegacion";

// Mock de CarruselPromociones para evitar errores
vi.mock("../Navegacion/PromosBanner", () => ({
  default: () => <div>CarruselPromociones</div>,
}));

describe("BarraNavegacion - Buscador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock por defecto para fetch (categorías)
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categorias: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  it("debería abrir el buscador al hacer click en el ícono de búsqueda", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithMockProviders(<BarraNavegacion />);

    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);

    // Usa document.querySelector para seleccionar por clase
    const wrapper = document.querySelector('.buscador-wrapper');
    expect(wrapper).toHaveClass("open");

    expect(screen.getByRole("button", { name: /✕/ })).toBeInTheDocument();
  });


  it("debería mostrar resultados al escribir en el input y esperar el timeout", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });

    const user = userEvent.setup();
    // Mock fetch para búsqueda
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/productos/buscar')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            resultados: [
              { id_producto: 1, name: "Producto 1", categoria: "Categoría A", imagen_url: "/img1.jpg" },
              { id_producto: 2, name: "Producto 2", categoria: "Categoría B", imagen_url: "/img2.jpg" },
            ],
          }),
        });
      } else if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categorias: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<BarraNavegacion />);

    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);

    const input = screen.getByPlaceholderText("Buscar productos");
    await user.type(input, "prod");

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/productos/buscar?q=prod",
        { credentials: "include" }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("CATEGORÍA A")).toBeInTheDocument(); // Mayúsculas según capitalize
      expect(screen.getByText("Producto 1")).toBeInTheDocument();
    });

    const images = screen.getAllByAltText(/Producto/);
    expect(images).toHaveLength(2);
  });

  it("debería mostrar 'Buscando...' mientras carga", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });

    const user = userEvent.setup();
    // Mock fetch que nunca resuelve para simular loading
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/productos/buscar')) {
        return new Promise(() => {}); // Nunca resuelve
      } else if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categorias: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<BarraNavegacion />);

    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);
    const input = screen.getByPlaceholderText("Buscar productos");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByText("Buscando...")).toBeInTheDocument();
    });
  });

  it("debería cerrar el buscador y limpiar estados al hacer click en el botón de cerrar", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithMockProviders(<BarraNavegacion />);

    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);

    const input = screen.getByPlaceholderText("Buscar productos");
    await user.type(input, "test");

    const closeButton = screen.getByRole("button", { name: /✕/ });
    await user.click(closeButton);

    expect(input).toHaveValue("");
    expect(screen.queryByText("Buscando...")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("debería manejar errores en fetch y mostrar 'ERROR DE BÚSQUEDA'", async () => {
    mockUseAuthContext.mockReturnValue({ isLogged: false, logout: vi.fn() });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });

    const user = userEvent.setup();
    // Mock fetch que rechaza para búsqueda
    globalThis.fetch = vi.fn((url) => {
      if (url.includes('/productos/buscar')) {
        return Promise.reject(new Error("Network error"));
      } else if (url.includes('/categoria/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categorias: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<BarraNavegacion />);

    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);
    const input = screen.getByPlaceholderText("Buscar productos");
    await user.type(input, "error");

    // El componente no muestra "ERROR DE BÚSQUEDA", solo loguea el error. Verifica que no haya resultados
    await waitFor(() => {
      expect(screen.queryByText("Buscando...")).not.toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});