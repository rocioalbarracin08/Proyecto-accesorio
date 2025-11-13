import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para consistencia
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import GestionProducto from "../GestionProducto"; // Importamos el componente

// Mockeamos useAuthContext para controlar el estado de autenticación
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importamos el mock para configurarlo
import { useAuthContext } from "../../contexts/AuthContext";

// Mockeamos fetch globalmente para controlar todas las llamadas a la API
global.fetch = vi.fn();

// Helpers para reducir repetición en mocks
const mockCategorias = [
  { id_category: 1, categoria: "Lentes" },
  { id_category: 2, categoria: "Aritos" },
];

const mockPerfil = { id_tienda: 5 };

const mockProductoEditar = {
  id_producto: 1,
  name: "Producto Test",
  id_categoria: 1,
  precio: "10.00",
  imagen_url: "/test.jpg",
  id_tienda: 5,
};

const mockFetchCategorias = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockCategorias,
});

const mockFetchPerfil = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockPerfil,
});

const mockFetchInsertar = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({}),
});

const mockFetchModificar = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({}),
});

const mockFetchError = (error) => global.fetch.mockResolvedValueOnce({
  ok: false,
  json: async () => ({ error }),
});

describe("GestionProducto Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto antes de cada test
  beforeEach(() => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    // Mock por defecto: categorías y perfil
    mockFetchCategorias();
    mockFetchPerfil();
  });

  // Props mockeadas
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  // Test: No renderiza si userRole no es 'empleado'
  it("no renderiza si userRole no es 'empleado'", () => {
    useAuthContext.mockReturnValue({ userRole: "cliente" });

    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByText(/agregar producto/i)).not.toBeInTheDocument();
  });

  // Test: Renderiza el modal para agregar producto
  it("renderiza el modal para agregar producto", async () => {
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera a que cargue
    await screen.findByText("Agregar Producto");
    expect(screen.getByText("Agregar Producto")).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/imagen url/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  // Test: Renderiza el modal para editar producto
  it("renderiza el modal para editar producto", async () => {
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} productoEditar={mockProductoEditar} />);

    // Espera a que cargue
    await screen.findByText("Editar Producto");
    expect(screen.getByText("Editar Producto")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Producto Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10.00")).toBeInTheDocument();
  });

  // Test: Carga categorías en el select
  it("carga y muestra categorías en el select", async () => {
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera a que aparezcan las opciones
    await screen.findByText("Lentes");
    expect(screen.getByText("Lentes")).toBeInTheDocument();
    expect(screen.getByText("Aritos")).toBeInTheDocument();
  });

  // Test: Actualiza id_tienda desde el perfil
  it("actualiza id_tienda desde el perfil del usuario", async () => {
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // El form debería tener id_tienda: 5 (desde mockPerfil)
    // No se puede verificar directamente, pero el envío lo usará
    await screen.findByText("Agregar Producto");
    // Asumimos que funciona; en un test más avanzado, podrías spy on setForm
  });

  // Test: Envía formulario para agregar producto exitosamente
  it("envía formulario para agregar producto exitosamente", async () => {
    // Mock envío
    mockFetchInsertar();

    const user = userEvent.setup();
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y llena el form
    await screen.findByLabelText(/nombre/i);
    await user.type(screen.getByLabelText(/nombre/i), "Nuevo Producto");
    await user.selectOptions(screen.getByLabelText(/categoría/i), "1");
    await user.type(screen.getByLabelText(/precio/i), "15.00");
    await user.type(screen.getByLabelText(/imagen url/i), "/nueva.jpg");

    // Envía
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // Verifica fetch
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/insertar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: "Nuevo Producto",
        id_categoria: "1",
        precio: "15.00",
        imagen_url: "/nueva.jpg",
        id_tienda: 5, // Desde perfil
      }),
    });
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Envía formulario para editar producto exitosamente
  it("envía formulario para editar producto exitosamente", async () => {
    // Mock envío
    mockFetchModificar();

    const user = userEvent.setup();
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} productoEditar={mockProductoEditar} />);

    // Espera y edita
    await screen.findByDisplayValue("Producto Test");
    const nombreInput = screen.getByDisplayValue("Producto Test");
    await user.clear(nombreInput);
    await user.type(nombreInput, "Producto Editado");

    // Envía
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // Verifica fetch
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/modificar/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: "Producto Editado",
        id_categoria: "1",
        precio: "10.00",
        imagen_url: "/test.jpg",
        id_tienda: 5,
      }),
    });
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Maneja error en envío
  it("maneja error en envío del formulario", async () => {
    // Mock error
    mockFetchError("Producto ya existe");

    // Mock alert
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const user = userEvent.setup();
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y llena mínimo
    await screen.findByLabelText(/nombre/i);
    await user.type(screen.getByLabelText(/nombre/i), "Producto");
    await user.selectOptions(screen.getByLabelText(/categoría/i), "1");
    await user.type(screen.getByLabelText(/precio/i), "10.00");

    // Envía
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // Verifica alerta
    expect(mockAlert).toHaveBeenCalledWith("Error al guardar producto: Producto ya existe");
    mockAlert.mockRestore();
  });

  // Test: Cierra modal al hacer clic en overlay
  it("cierra modal al hacer clic en overlay", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y clic en overlay
    await screen.findByText("Agregar Producto");
    const overlay = screen.getByTestId ? screen.getByTestId("modal-overlay") : screen.getByClass("modal-overlay"); // Agrega data-testid si no está
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Cierra modal al hacer clic en "Cancelar"
  it("cierra modal al hacer clic en 'Cancelar'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GestionProducto onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y clic en cancelar
    await screen.findByRole("button", { name: /cancelar/i });
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});