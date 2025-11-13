import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para consistencia
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import CrearCategoria from "../CrearCategoria"; // Importamos el componente

// Mockeamos axios para controlar las llamadas a la API
vi.mock('axios');
const mockedAxios = vi.mocked(import('axios'));

// Mockeamos useCategorias para controlar el contexto
vi.mock('../../contexts/CategoriasContext', () => ({
  useCategorias: vi.fn(),
}));

// Importamos el mock para configurarlo
import { useCategorias } from '../../contexts/CategoriasContext';

describe("CrearCategoria Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto: Mock de useCategorias
  beforeEach(() => {
    useCategorias.mockReturnValue({
      cargarCategorias: vi.fn(),
    });
  });

  // Props mockeadas
  const mockOnCerrar = vi.fn();

  // Test: Renderiza el modal correctamente
  it("renderiza el modal de crear categoría", () => {
    renderWithProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    expect(screen.getByText("Crear Categoría")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nombre de la categoría/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/url de imagen/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  // Test: Actualiza el estado del formulario al cambiar inputs
  it("actualiza el estado del formulario al cambiar los inputs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre de la categoría/i);
    const urlInput = screen.getByPlaceholderText(/url de imagen/i);
    const checkbox = screen.getByRole("checkbox");
    
    // Cambia el nombre
    await user.type(nombreInput, "Lentes");
    expect(nombreInput).toHaveValue("Lentes");
    
    // Cambia la URL
    await user.type(urlInput, "/lentes.jpg");
    expect(urlInput).toHaveValue("/lentes.jpg");
    
    // Desmarca el checkbox
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  // Test: Envía el formulario y llama a cargarCategorias y onCerrar en éxito
  it("envía el formulario y llama a cargarCategorias y onCerrar en éxito", async () => {
    const mockCargarCategorias = vi.fn();
    useCategorias.mockReturnValue({
      cargarCategorias: mockCargarCategorias,
    });
    
    // Mock axios.post para éxito
    mockedAxios.post.mockResolvedValue({});
    
    const user = userEvent.setup();
    renderWithProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre de la categoría/i);
    const submitButton = screen.getByRole("button", { name: /crear/i });
    
    // Llena el formulario
    await user.type(nombreInput, "Aritos");
    await user.click(submitButton);
    
    // Verifica que axios.post haya sido llamado con los datos correctos
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:5000/categoria/",
      { categoria: "Aritos", img_url: "", activo: true },
      { withCredentials: true }
    );
    // Verifica que se llamen las funciones de éxito
    expect(mockCargarCategorias).toHaveBeenCalled();
    expect(mockOnCerrar).toHaveBeenCalled();
  });

  // Test: Muestra alerta de error si el envío falla
  it("muestra alerta de error si el envío falla", async () => {
    // Mock axios.post para error
    mockedAxios.post.mockRejectedValue(new Error("Error de API"));
    
    // Mock window.alert para verificar que se llame
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const user = userEvent.setup();
    renderWithProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre de la categoría/i);
    const submitButton = screen.getByRole("button", { name: /crear/i });
    
    // Llena y envía
    await user.type(nombreInput, "Lentes");
    await user.click(submitButton);
    
    // Verifica que se muestre la alerta de error
    expect(mockAlert).toHaveBeenCalledWith("Error al crear");
    
    // Limpiamos el mock
    mockAlert.mockRestore();
  });

  // Test: Llama a onCerrar al hacer clic en "Cancelar"
  it("llama a onCerrar al hacer clic en 'Cancelar'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);
    
    // Verifica que onCerrar haya sido llamado
    expect(mockOnCerrar).toHaveBeenCalled();
  });

  // Test: No envía si el campo requerido está vacío
  it("no envía el formulario si el nombre de la categoría está vacío", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const submitButton = screen.getByRole("button", { name: /crear/i });
    
    // Intenta enviar sin llenar (el input tiene required, pero testeamos)
    await user.click(submitButton);
    
    // Verifica que no se llame a axios (ya que el form no se envía)
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});