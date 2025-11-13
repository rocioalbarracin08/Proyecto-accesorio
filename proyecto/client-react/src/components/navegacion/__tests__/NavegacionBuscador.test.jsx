import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithMockProviders, screen, waitFor, userEvent } from "../../../test/test-utils"; // Ajusta la ruta si es necesario
import { BarraNavegacion } from "../Navegacion"; // Ajusta la ruta al componente

// Mock global para fetch (simula respuestas de la API)
globalThis.fetch = vi.fn();

describe("BarraNavegacion - Buscador", () => {
  beforeEach(() => {
    // Resetea mocks antes de cada test
    vi.clearAllMocks();
    globalThis.fetch.mockClear();

      // Mock por defecto para el fetch inicial de categorías
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("debería abrir el buscador al hacer click en el ícono de búsqueda", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<BarraNavegacion />);

    // Obtén el wrapper del buscador (que controla la visibilidad con la clase 'open')
    const wrapper = screen.getByPlaceholderText("Buscar producto o categoría").closest('.buscador-wrapper');
    
    // Verifica que el wrapper NO tenga la clase 'open' inicialmente (buscador cerrado)
    expect(wrapper).not.toHaveClass('open');
    
    // Verifica que el botón de cerrar NO esté presente inicialmente
    expect(screen.queryByRole("button", { name: /✕/ })).not.toBeInTheDocument();

    // Haz click en el ícono de búsqueda
    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);

    // Verifica que el wrapper TENGA la clase 'open' ahora (buscador abierto)
    expect(wrapper).toHaveClass('open');
    
    // Verifica que el botón de cerrar esté presente ahora
    expect(screen.getByRole("button", { name: /✕/ })).toBeInTheDocument();
  });


  it("debería mostrar resultados al escribir en el input y esperar el timeout", async () => {
    const user = userEvent.setup();
    // Mockea fetch para devolver productos
    const mockProductos = [
      { id_producto: 1, name: "Producto 1", categoria: "Categoría A", imagen_url: "/img1.jpg" },
      { id_producto: 2, name: "Producto 2", categoria: "Categoría B", imagen_url: "/img2.jpg" },
    ];
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resultados: mockProductos }),
    });

    renderWithMockProviders(<BarraNavegacion />);

    // Abre el buscador
    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);

    // Escribe en el input (más de 2 caracteres para activar búsqueda)
    const input = screen.getByPlaceholderText("Buscar producto o categoría");
    await user.type(input, "prod");

    // Espera el timeout de 300ms y que fetch se llame
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/productos/buscar?q=prod"
      );
    });

    // Verifica que se muestre el dropdown con resultados
    await waitFor(() => {
      expect(screen.getByText("Categoría A: Producto 1")).toBeInTheDocument(); //union de dos nodos
      expect(screen.getByText("Categoría B: Producto 2")).toBeInTheDocument();
    });

    // Verifica que las imágenes estén presentes (opcional)
    const images = screen.getAllByAltText(/Producto/);
    expect(images).toHaveLength(2);
  });

  it("debería mostrar 'Buscando...' mientras carga", async () => {
    const user = userEvent.setup();
    // Mockea fetch para que tarde (simula loading)
    globalThis.fetch.mockImplementation(() => new Promise(() => {})); // Nunca resuelve para simular loading

    renderWithMockProviders(<BarraNavegacion />);

    // Abre el buscador y escribe
    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);
    const input = screen.getByPlaceholderText("Buscar producto o categoría");
    await user.type(input, "test");

    // Espera que aparezca "Buscando..."
    await waitFor(() => {
      expect(screen.getByText("Buscando...")).toBeInTheDocument();
    });
  });

  it("debería cerrar el buscador y limpiar estados al hacer click en el botón de cerrar", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<BarraNavegacion />);

    // Abre el buscador
    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);

    // Escribe algo
    const input = screen.getByPlaceholderText("Buscar producto o categoría");
    await user.type(input, "test");

    // Hace click en el botón de cerrar
    const closeButton = screen.getByRole("button", { name: /✕/ });
    await user.click(closeButton);

    // Verifica que el input esté vacío y el dropdown oculto
    expect(input).toHaveValue("");
    expect(screen.queryByText("Buscando...")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument(); // Dropdown como <ul>
  });

  it("debería manejar errores en fetch y mostrar 'ERROR DE BÚSQUEDA'", async () => {
    const user = userEvent.setup();
    // Mockea fetch para que falle
    globalThis.fetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithMockProviders(<BarraNavegacion />);

    // Abre y escribe
    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await user.click(searchIcon);
    const input = screen.getByPlaceholderText("Buscar producto o categoría");
    await user.type(input, "error");

    // Espera y verifica que se muestre el error
    await waitFor(() => {
      expect(
        screen.getByText(/(ERROR DE BÚSQUEDA|Network error)/i)
      ).toBeInTheDocument();
    });
  });
});