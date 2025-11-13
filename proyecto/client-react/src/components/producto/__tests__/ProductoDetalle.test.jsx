import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones
import ProductoDetalle from "../ProductoDetalle"; // Importamos el componente

// Mockeamos useParams para simular id_producto
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: mockUseParams,
  };
});

// Mockeamos contextos
vi.mock("../../contexts/CarritoContext", () => ({
  useCarrito: vi.fn(),
}));
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));
vi.mock("../../contexts/PromocionesContext", () => ({
  usePromociones: vi.fn(),
}));

// Importamos mocks
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { usePromociones } from "../../contexts/PromocionesContext";

// Mockeamos ProductoItem
vi.mock("./ProductoItem", () => ({
  default: ({ producto }) => <div data-testid={`producto-item-${producto.id_producto}`}>{producto.name}</div>,
}));

// Mockeamos fetch global
global.fetch = vi.fn();

// Helpers para mocks
const mockProducto = {
  id_producto: 1,
  name: "Producto Test",
  descripcion: "Descripción test",
  precio: 20.00,
  imagen_url: "/test.jpg",
  id_categoria: 1,
  stock: 10,
};

const mockRelacionados = [
  { id_producto: 2, name: "Relacionado 1", id_categoria: 1 },
  { id_producto: 3, name: "Relacionado 2", id_categoria: 1 },
  { id_producto: 4, name: "Relacionado 3", id_categoria: 1 },
  { id_producto: 5, name: "Relacionado 4", id_categoria: 1 },
  { id_producto: 6, name: "Relacionado 5", id_categoria: 1 },
];

const mockPromociones = [
  { id_promocion: 1, id_categoria: 1, descuento: 0.1, tipo_descuento: "porcentaje", activo: true, fecha_inicio: "2023-01-01", fecha_fin: "2023-12-31", id_metodo_pago: null },
];

const mockFetchProducto = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockProducto,
});

const mockFetchRelacionados = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ productos: mockRelacionados }),
});

const mockFetchError = () => global.fetch.mockRejectedValueOnce(new Error("Error de red"));

describe("ProductoDetalle Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockUseParams.mockReturnValue({ id_producto: "1" });
    useCarrito.mockReturnValue({ addItem: vi.fn(), openCarrito: vi.fn() });
    useAuthContext.mockReturnValue({ userRole: "cliente" });
    usePromociones.mockReturnValue({ promociones: mockPromociones });
    mockFetchProducto();
    mockFetchRelacionados();
  });

  it("muestra loading mientras carga producto", () => {
    renderWithProviders(<ProductoDetalle />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("muestra error si fetch falla", async () => {
    mockFetchError();
    renderWithProviders(<ProductoDetalle />);
    expect(await screen.findByText(/error cargando producto/i)).toBeInTheDocument();
  });

  it("renderiza detalles del producto", async () => {
    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("Producto Test");
    expect(screen.getByText("Producto Test")).toBeInTheDocument();
    expect(screen.getByText("Descripción test")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeInTheDocument();
  });

  it("muestra precio con descuento si hay promoción", async () => {
    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("$20.00");
    expect(screen.getByText("$18.00")).toBeInTheDocument(); // 20 * 0.9
    expect(screen.getByText("$20.00")).toHaveClass("precio-original");
  });

  it("muestra cartelito de promoción", async () => {
    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("Producto Test");
    expect(screen.getByText(/hay promoción en esta categoría/i)).toBeInTheDocument();
  });

  it("muestra stock si userRole es empleado", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("Producto Test");
    expect(screen.getByText("Stock: 10")).toBeInTheDocument();
  });

  it("agrega producto al carrito al hacer clic", async () => {
    const mockAddItem = vi.fn();
    const mockOpenCarrito = vi.fn();
    useCarrito.mockReturnValue({ addItem: mockAddItem, openCarrito: mockOpenCarrito });

    const user = userEvent.setup();
    renderWithProviders(<ProductoDetalle />);
    await screen.findByRole("button", { name: /agregar al carrito/i });
    await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));

    expect(mockAddItem).toHaveBeenCalledWith({ ...mockProducto, precio: 18.00 });
    expect(mockOpenCarrito).toHaveBeenCalled();
  });

  it("deshabilita botón si stock es 0", async () => {
    const productoSinStock = { ...mockProducto, stock: 0 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => productoSinStock,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ productos: [] }),
    });

    renderWithProviders(<ProductoDetalle />);
    await screen.findByRole("button", { name: /agregar al carrito/i });
    expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeDisabled();
  });

  it("renderiza carrusel de productos relacionados", async () => {
    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("Productos Relacionados");
    expect(screen.getByText("Productos Relacionados")).toBeInTheDocument();
    expect(screen.getByTestId("producto-item-2")).toBeInTheDocument();
  });

  it("navega en carrusel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("Productos Relacionados");

    const nextBtn = screen.getByText(">");
    await user.click(nextBtn);
    expect(screen.getByTestId("producto-item-3")).toBeInTheDocument(); // Verifica cambio
  });

  it("deshabilita botones de carrusel si no hay suficientes productos", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducto,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ productos: mockRelacionados.slice(0, 3) }), // Solo 3
    });

    renderWithProviders(<ProductoDetalle />);
    await screen.findByText("Productos Relacionados");

    const nextBtn = screen.getByText(">");
    expect(nextBtn).toBeDisabled();
  });
});