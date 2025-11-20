import React from "react";
import { renderWithMockProviders, screen, mockUseCategorias } from "../../../test/test-utils"; // Cambié a renderWithMockProviders
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import CrearCategoria from "../CrearCategoria";

// Mockeamos axios
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios);

// Mockeamos useCategorias
vi.mock('../../../contexts/CategoriasContext', () => ({
  useCategorias: mockUseCategorias,
}));


describe("CrearCategoria Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockUseCategorias.mockReturnValue({
      cargarCategorias: vi.fn(),
    });
  });

  const mockOnCerrar = vi.fn();

  it("renderiza el modal de crear categoría", () => {
    renderWithMockProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    expect(screen.getByText("Crear Categoría")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nombre de la categoria/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/URL de imagen/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
  });

  it("actualiza el estado del formulario al cambiar los inputs", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const nombreInput = screen.getByPlaceholderText(/Nombre de la categoria/i);
    const urlInput = screen.getByPlaceholderText(/URL de imagen/i);
    const checkbox = screen.getByRole("checkbox");
    
    await user.type(nombreInput, "Lentes");
    expect(nombreInput).toHaveValue("Lentes");
    
    await user.type(urlInput, "/lentes.jpg");
    expect(urlInput).toHaveValue("/lentes.jpg");
    
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("envía el formulario y llama a cargarCategorias y onCerrar en éxito", async () => {
    const mockCargarCategorias = vi.fn();
    mockUseCategorias.mockReturnValue({
      cargarCategorias: mockCargarCategorias,
    });
    
    mockedAxios.post.mockResolvedValue({});
    
    const user = userEvent.setup();
    renderWithMockProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const nombreInput = screen.getByPlaceholderText(/Nombre de la categoria/i);
    const submitButton = screen.getByRole("button", { name: /crear/i });
    
    await user.type(nombreInput, "Aritos");
    await user.click(submitButton);
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:5000/categoria/",
      { categoria: "Aritos", img_url: "", activo: 1 },  // activo convertido a 1
      { withCredentials: true }
    );
    expect(mockCargarCategorias).toHaveBeenCalled();
    expect(mockOnCerrar).toHaveBeenCalled();
  });

  it("muestra alerta de error si el envío falla", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error de API"));
    
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const user = userEvent.setup();
    renderWithMockProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const nombreInput = screen.getByPlaceholderText(/Nombre de la categoria/i);
    const submitButton = screen.getByRole("button", { name: /Crear/i });
    
    await user.type(nombreInput, "Lentes");
    await user.click(submitButton);
    
    expect(mockAlert).toHaveBeenCalledWith("Error al crear");
    
    mockAlert.mockRestore();
  });

  it("llama a onCerrar al hacer clic en 'Cancelar'", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });
    await user.click(cancelButton);
    
    expect(mockOnCerrar).toHaveBeenCalled();
  });

  it("no envía el formulario si el nombre de la categoría está vacío", async () => {
    const user = userEvent.setup();
    renderWithMockProviders(<CrearCategoria onCerrar={mockOnCerrar} />);
    
    const submitButton = screen.getByRole("button", { name: /Crear/i });
    
    await user.click(submitButton);
    
    expect(mockedAxios.post).not.toHaveBeenCalled();  // No se envía si está vacío
  });
});