import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders; asegúrate de agregar CategoriasProvider si no está incluido
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import Categorias from "../Categorias"; // Importamos el componente

// Importamos el mock para configurarlo
import { useCategorias } from '../../contexts/CategoriasContext';

// Mockeamos axios para controlar las llamadas a la API (aunque no se use directamente en el componente, por si acaso)
vi.mock('axios');

// Mockeamos useNavigate para controlar navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos useCategorias para controlar el contexto
vi.mock('../../contexts/CategoriasContext', () => ({
  useCategorias: vi.fn(),
}));

describe("Categorias Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto: Estado inicial del contexto
  beforeEach(() => {
    useCategorias.mockReturnValue({
      categorias: [],
      loading: false,
      error: null,
      cargarCategorias: vi.fn(),
      eliminarCategoria: vi.fn(),
      toggleActivo: vi.fn(),
    });
  });

  // Test: Muestra loading inicialmente
  it("muestra 'Cargando...' mientras carga categorías", () => {
    useCategorias.mockReturnValue({
      ...useCategorias(),
      loading: true,
    });

    renderWithProviders(<Categorias />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // Test: Muestra error si hay error
  it("muestra mensaje de error si falla la carga", () => {
    useCategorias.mockReturnValue({
      ...useCategorias(),
      loading: false,
      error: "Error al cargar categorías",
    });

    renderWithProviders(<Categorias />);
    expect(screen.getByText("Error al cargar categorías")).toBeInTheDocument();
  });

  // Test: Renderiza la lista de categorías (con datos de accesorios)
  it("renderiza la lista de categorías", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
      { id_category: 2, categoria: "Aritos", activo: false, img_url: "/aritos.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
    });

    renderWithProviders(<Categorias />);
    expect(screen.getByText("Categorías")).toBeInTheDocument();
    expect(screen.getByText("Lentes - Activa: Sí")).toBeInTheDocument();
    expect(screen.getByText("Aritos - Activa: No")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  // Test: Navega atrás al hacer clic en "Volver Atrás"
  it("navega hacia atrás al hacer clic en 'Volver Atrás'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Categorias />);
    
    const backButton = screen.getByText("Volver Atrás");
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // Test: Muestra modal de crear categoría
  it("muestra el modal de crear categoría al hacer clic en 'Crear Categoría'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Categorias />);
    
    const createButton = screen.getByText("Crear Categoría");
    await user.click(createButton);
    
    // Asume que CrearCategoria renderiza algo detectable, ej. título
    expect(screen.getByText(/crear categoría/i)).toBeInTheDocument(); // Ajusta según el contenido real
  });

  // Test: Muestra modal de editar categoría
  it("muestra el modal de editar categoría al hacer clic en 'Editar'", async () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
    });

    const user = userEvent.setup();
    renderWithProviders(<Categorias />);
    
    const editButton = screen.getByText("Editar");
    await user.click(editButton);
    
    // Asume que EditarCategoria renderiza algo detectable
    expect(screen.getByText(/editar categoría/i)).toBeInTheDocument(); // Ajusta según el contenido real
  });

  // Test: No permite editar si la categoría no está activa
  it("deshabilita el botón 'Editar' si la categoría no está activa", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Aritos", activo: false, img_url: "/aritos.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
    });

    renderWithProviders(<Categorias />);
    const editButton = screen.getByText("Editar");
    expect(editButton).toBeDisabled();
  });

  // Test: Llama a toggleActivo al hacer clic en "Desactivar/Activar"
  it("llama a estado al hacer clic en 'Desactivar'", async () => {
    const mockToggleActivo = vi.fn();
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
      toggleActivo: mockToggleActivo,
    });

    const user = userEvent.setup();
    renderWithProviders(<Categorias />);
    
    const toggleButton = screen.getByText("Desactivar");
    await user.click(toggleButton);
    
    expect(mockToggleActivo).toHaveBeenCalledWith(1);
  });

  // Test: Llama a eliminarCategoria al confirmar eliminación
  it("llama a eliminarCategoria al confirmar eliminación", async () => {
    const mockEliminarCategoria = vi.fn();
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
      eliminarCategoria: mockEliminarCategoria,
    });

    // Mock window.confirm para simular confirmación
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    const user = userEvent.setup();
    renderWithProviders(<Categorias />);
    
    const deleteButton = screen.getByText("Eliminar");
    await user.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalledWith("¿Eliminar categoría?");
    expect(mockEliminarCategoria).toHaveBeenCalledWith(1);
    
    mockConfirm.mockRestore();
  });

  // Test: No llama a eliminarCategoria si se cancela la confirmación
  it("no llama a eliminarCategoria si se cancela la confirmación", async () => {
    const mockEliminarCategoria = vi.fn();
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
      eliminarCategoria: mockEliminarCategoria,
    });

    // Mock window.confirm para simular cancelación
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    const user = userEvent.setup();
    renderWithProviders(<Categorias />);
    
    const deleteButton = screen.getByText("Eliminar");
    await user.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalledWith("¿Eliminar categoría?");
    expect(mockEliminarCategoria).not.toHaveBeenCalled();
    
    mockConfirm.mockRestore();
  });

  // Test: Deshabilita "Eliminar" si la categoría no está activa
  it("deshabilita el botón 'Eliminar' si la categoría no está activa", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Aritos", activo: false, img_url: "/aritos.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
    });

    renderWithProviders(<Categorias />);
    const deleteButton = screen.getByText("Eliminar");
    expect(deleteButton).toBeDisabled();
  });

  // Test adicional: Verifica que se muestre la imagen si existe
  it("muestra la imagen de la categoría si img_url existe", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    useCategorias.mockReturnValue({
      ...useCategorias(),
      categorias: mockCategorias,
    });

    renderWithProviders(<Categorias />);
    const img = screen.getByAltText("Lentes");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/lentes.jpg");
  });
});