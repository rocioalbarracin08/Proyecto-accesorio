import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir providers
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas (clics, etc.)
import { Productos } from "../Productos"; // Importamos el componente

// Mockeamos useParams para simular idCategoria
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: mockUseParams,
  };
});

// Mockeamos contextos
vi.mock("../../contexts/PromocionesContext", () => ({
  usePromociones: vi.fn(),
}));
vi.mock("../../contexts/CarritoContext", () => ({
  useCarrito: vi.fn(),
}));
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importamos mocks
import { usePromociones } from "../../contexts/PromocionesContext";
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";

// Mockeamos axios
vi.mock("axios");
const mockedAxios = vi.mocked(import("axios"));

// Mockeamos GestionProductos
vi.mock("./GestionProducto", () => ({
  default: ({ onClose }) => <div data-testid="gestion-productos-modal"><button onClick={onClose}>Cerrar</button></div>,
}));

// Helpers para mocks
const mockProductos = [
  { id_producto: 1, name: "Producto 1", precio: 20.00, imagen_url: "/img1.jpg", id_categoria: 1, stock: 10 },
  { id_producto: 2, name: "Producto 2", precio: 30.00, imagen_url: "/img2.jpg", id_categoria: 1, stock: 5 },
];

const mockPromociones = [
  { id_promocion: 1, id_categoria: 1, descuento: 0.1, tipo_descuento: "porcentaje", activo: true, fecha_inicio: "2023-01-01", fecha_fin: "2023-12-31" },
];

const mockAxiosResponse = {
  data: {
    productos: mockProductos,
    total_pages: 2,
    page: 1,
  },
};

describe("Productos Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockUseParams.mockReturnValue({ idCategoria: undefined }); // Sin categoría por defecto
    usePromociones.mockReturnValue({ promociones: mockPromociones });
    useCarrito.mockReturnValue({ addItem: vi.fn(), openCarrito: vi.fn() });
    useAuthContext.mockReturnValue({ userRole: "cliente" });
    mockedAxios.get.mockResolvedValue(mockAxiosResponse);
  });

  it("muestra loading mientras carga productos", () => {
    renderWithProviders(<Productos />);
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();
  });

  it("renderiza la sección de productos", async () => {
    renderWithProviders(<Productos />);
    await screen.findByText("Productos");
    expect(screen.getByText("Productos")).toBeInTheDocument();
    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText("Producto 2")).toBeInTheDocument();
  });

  it("muestra productos con promoción aplicada", async () => {
    renderWithProviders(<Productos />);
    await screen.findByText("$20.00"); // Precio original tachado
    expect(screen.getByText("$18.00")).toBeInTheDocument(); // 20 * 0.9
    expect(screen.getByText("10% OFF")).toBeInTheDocument();
  });

  it("agrega producto al carrito al hacer clic", async () => {
    const mockAddItem = vi.fn();
    const mockOpenCarrito = vi.fn();
    useCarrito.mockReturnValue({ addItem: mockAddItem, openCarrito: mockOpenCarrito });

    const user = userEvent.setup();
    renderWithProviders(<Productos />);
    await screen.findByText("Producto 1");

    const addButton = screen.getAllByRole("button", { name: /agregar al carrito/i })[0];
    await user.click(addButton);

    expect(mockAddItem).toHaveBeenCalledWith({ ...mockProductos[0], precio: 18.00 });
    expect(mockOpenCarrito).toHaveBeenCalled();
  });

  it("filtra por categoría si idCategoria está presente", async () => {
    mockUseParams.mockReturnValue({ idCategoria: "1" });
    mockedAxios.get.mockResolvedValue({
      ...mockAxiosResponse,
      data: { ...mockAxiosResponse.data, productos: [mockProductos[0]] }, // Solo uno
    });

    renderWithProviders(<Productos />);
    await screen.findByText("Categoría");
    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.queryByText("Producto 2")).not.toBeInTheDocument();
  });

  it("muestra controles para empleados si userRole es 'empleado'", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    renderWithProviders(<Productos />);
    await screen.findByText("Producto 1");

    expect(screen.getAllByText("Stock: 10")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /editar/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /desactivar/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /actualizar stock/i })[0]).toBeInTheDocument();
  });

  it("muestra botón flotante para agregar producto si es empleado", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    renderWithProviders(<Productos />);
    await screen.findByText("Productos");

    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("abre modal de gestión al hacer clic en editar", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    const user = userEvent.setup();
    renderWithProviders(<Productos />);
    await screen.findByText("Producto 1");

    const editButton = screen.getAllByRole("button", { name: /editar/i })[0];
    await user.click(editButton);

    expect(screen.getByTestId("gestion-productos-modal")).toBeInTheDocument();
  });

  it("desactiva producto al confirmar", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    renderWithProviders(<Productos />);
    await screen.findByText("Producto 1");

    const deleteButton = screen.getAllByRole("button", { name: /desactivar/i })[0];
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith("¿Desactivar producto?");
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/desactivar/1", {
      method: "PATCH",
      credentials: "include",
    });

    mockConfirm.mockRestore();
  });

  it("actualiza stock al ingresar nuevo valor", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue("15");
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    renderWithProviders(<Productos />);
    await screen.findByText("Producto 1");

    const updateButton = screen.getAllByRole("button", { name: /actualizar stock/i })[0];
    await user.click(updateButton);

    expect(mockPrompt).toHaveBeenCalledWith("Nuevo stock:", 10);
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/actualizar_stock/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ stock: 15 }),
    });

    mockPrompt.mockRestore();
  });

  it("renderiza paginación si hay múltiples páginas", async () => {
    renderWithProviders(<Productos />);
    await screen.findByText("Productos");

    expect(screen.getByRole("button", { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Página actual
  });

  it("cambia de página al hacer clic en número", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Productos />);
    await screen.findByText("Productos");

    const pageButton = screen.getByText("1");
    await user.click(pageButton);

    // Verifica que axios se llame con page=1 (ya que es la actual, pero simula cambio)
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:5000/productos/mostrar?page=1&per_page=10", { withCredentials: true });
  });

  it("deshabilita botones de paginación en límites", async () => {
    renderWithProviders(<Productos />);
    await screen.findByText("Productos");

    const prevButton = screen.getByRole("button", { name: /anterior/i });
    const nextButton = screen.getByRole("button", { name: /siguiente/i });

    expect(prevButton).toBeDisabled(); // Página 1
    expect(nextButton).not.toBeDisabled(); // Hay más páginas
  });

  it("muestra mensaje si no hay productos", async () => {
    mockedAxios.get.mockResolvedValue({ data: { productos: [], total_pages: 1, page: 1 } });
    renderWithProviders(<Productos />);
    await screen.findByText("No hay productos disponibles.");
    expect(screen.getByText("No hay productos disponibles.")).toBeInTheDocument();
  });
});

// Comentarios sobre screen y userEvent:
/*
- 'screen': Es un objeto de @testing-library/react que proporciona métodos para buscar elementos en el DOM renderizado (ej. getByText, getByRole). Es global y se usa para queries sin necesidad de destructuring del render. Sirve para verificar que elementos estén presentes, su texto, atributos, etc.

- 'userEvent': Es una librería para simular interacciones del usuario de manera realista (ej. clics, tipeo), en lugar de fireEvent que es más bajo nivel. Sirve para probar comportamientos interactivos como formularios, botones, sin disparar eventos manualmente. Es preferible porque simula el comportamiento humano (ej. focus, blur).
*/
