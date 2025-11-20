import React from "react";
import { renderWithMockProviders, screen, mockUseCategorias } from "../../../test/test-utils"; // Importé mockUseCategorias
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Categorias from "../Categorias";

// Mockeamos los componentes modales para que rendericen algo detectable en los tests
vi.mock('../CrearCategoria', () => ({
  default: () => <div>Crear Categoría</div>,
}));
vi.mock('../EditarCategoria', () => ({
  default: () => <div>Editar Categoría</div>,
}));

vi.mock('../../../contexts/CategoriasContext', () => ({
  useCategorias: mockUseCategorias,
}));

// Mockeamos useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Removí el vi.mock de useCategorias, ya que ahora usamos mockUseCategorias de utils

describe("Categorias Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockUseCategorias.mockReturnValue({
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
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      loading: true,
    });

    renderWithMockProviders(<Categorias />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // Test: Muestra error si hay error
  it("muestra mensaje de error si falla la carga", () => {
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      loading: false,
      error: "Error al cargar categorías",
    });

    renderWithMockProviders(<Categorias />);
    expect(screen.getByText("Error al cargar categorías")).toBeInTheDocument();
  });

  // Test: Renderiza la lista de categorías
  it("renderiza la lista de categorías", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
      { id_category: 2, categoria: "Aritos", activo: false, img_url: "/aritos.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
    });

    renderWithMockProviders(<Categorias />);
    expect(screen.getByText("Categorías")).toBeInTheDocument();
    expect(screen.getByText("Lentes - Activa: Sí")).toBeInTheDocument();
    expect(screen.getByText("Aritos - Activa: No")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  // Test: Navega atrás al hacer clic en "Volver Atrás"
  it("navega hacia atrás al hacer clic en 'Volver Atrás'", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<Categorias />);
    
    const backButton = screen.getByText("Volver Atrás");
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // Test: Muestra modal de crear categoría
  it("muestra el modal de crear categoría al hacer clic en 'Crear Categoría'", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<Categorias />);
    
    const createButton = screen.getByText("Crear Categoría");
    await user.click(createButton);
    
    // Verifica que haya 2 elementos con "Crear Categoría" (botón + modal), con el toHaveLength(2)
    expect(screen.getAllByText("Crear Categoría")).toHaveLength(2);
  });

  // Test: Muestra modal de editar categoría
  it("muestra el modal de editar categoría al hacer clic en 'Editar'", async () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<Categorias />);
    
    const editButton = screen.getByText("Editar");
    await user.click(editButton);
    
    expect(screen.getByText("Editar Categoría")).toBeInTheDocument(); // Ahora detectable gracias al mock
  });

  // Test: No permite editar si la categoría no está activa
  it("deshabilita el botón 'Editar' si la categoría no está activa", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Aritos", activo: false, img_url: "/aritos.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
    });

    renderWithMockProviders(<Categorias />);
    const editButton = screen.getByText("Editar");
    expect(editButton).toBeDisabled();
  });

  // Test: Llama a toggleActivo al hacer clic en "Desactivar"
  it("llama a toggleActivo al hacer clic en 'Desactivar'", async () => {
    const mockToggleActivo = vi.fn();
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
      toggleActivo: mockToggleActivo,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<Categorias />);
    
    const toggleButton = screen.getByText("Desactivar");
    await user.click(toggleButton);
    
    expect(mockToggleActivo).toHaveBeenCalledWith(1);
  });

  // Test: Llama a eliminarCategoria al hacer clic en "Eliminar"
  it("llama a eliminarCategoria al hacer clic en 'Eliminar'", async () => {
    const mockEliminarCategoria = vi.fn();
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
      eliminarCategoria: mockEliminarCategoria,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<Categorias />);
    
    const deleteButton = screen.getByText("Eliminar");
    await user.click(deleteButton);
    
    expect(mockEliminarCategoria).toHaveBeenCalledWith(1);
  });

  // Test: Deshabilita "Eliminar" si la categoría no está activa
  it("deshabilita el botón 'Eliminar' si la categoría no está activa", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Aritos", activo: false, img_url: "/aritos.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
    });

    renderWithMockProviders(<Categorias />);
    const deleteButton = screen.getByText("Eliminar");
    expect(deleteButton).toBeDisabled();
  });

  // Test: Verifica que se muestre la imagen si existe
  it("muestra la imagen de la categoría si img_url existe", () => {
    const mockCategorias = [
      { id_category: 1, categoria: "Lentes", activo: true, img_url: "/lentes.jpg" },
    ];
    mockUseCategorias.mockReturnValue({
      ...mockUseCategorias(),
      categorias: mockCategorias,
    });

    renderWithMockProviders(<Categorias />);
    const img = screen.getByAltText("Lentes");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/lentes.jpg");
  });
});