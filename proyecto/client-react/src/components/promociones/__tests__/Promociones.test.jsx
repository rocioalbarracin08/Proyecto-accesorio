import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir todos los providers (como PromocionesProvider y MemoryRouter)
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para simular interacciones del usuario
import Promociones from "../Promociones"; // Importamos el componente a testear

// Mockeamos useNavigate para controlar la navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos usePromociones para controlar el estado del contexto
vi.mock('../../contexts/PromocionesContext', () => ({
  usePromociones: () => ({
    promociones: [
      { id_promocion: 1, descripcion: "Descuento 10%", descuento: 10, tipo_descuento: "porcentaje", activo: true },
      { id_promocion: 2, descripcion: "Envío gratis", descuento: 5, tipo_descuento: "fijo", activo: false },
    ], // Datos mockeados de promociones
    loading: false, // Estado inicial sin loading
    error: null, // Sin error inicialmente
    eliminarPromocion: vi.fn(), // Mock de función
    desactivarPromocion: vi.fn(), // Mock de función
  }),
}));

describe("Promociones Component", () => {
  // Limpiamos los mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test básico: Verifica que el componente renderice correctamente
  it("renderiza la sección de promociones", () => {
    renderWithProviders(<Promociones />);
    
    // Verificamos el título y elementos principales
    expect(screen.getByText(/promociones/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /volver atrás/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear promoción/i })).toBeInTheDocument();
  });

  // Test: Verifica que muestre la lista de promociones
  it("muestra la lista de promociones", () => {
    renderWithProviders(<Promociones />);
    
    // Verificamos que aparezcan las promociones mockeadas
    expect(screen.getByText("Descuento 10% - 10 (porcentaje) - Activa: Sí")).toBeInTheDocument();
    expect(screen.getByText("Envío gratis - 5 (fijo) - Activa: No")).toBeInTheDocument();
    
    // Verificamos que haya elementos de lista
    expect(screen.getAllByRole("listitem")).toHaveLength(2); // Dos promociones
  });

  // Test: Verifica estado de loading
  it("muestra mensaje de cargando cuando está en loading", () => {
    // Mockeamos usePromociones para simular loading
    vi.mocked(vi.importMock('../../contexts/PromocionesContext')).usePromociones.mockReturnValue({
      promociones: [],
      loading: true,
      error: null,
      eliminarPromocion: vi.fn(),
      desactivarPromocion: vi.fn(),
    });
    
    renderWithProviders(<Promociones />);
    
    // Verificamos que aparezca el mensaje de loading
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // Test: Verifica mensaje de error
  it("muestra mensaje de error si hay un error", () => {
    // Mockeamos usePromociones para simular error
    vi.mocked(vi.importMock('../../contexts/PromocionesContext')).usePromociones.mockReturnValue({
      promociones: [],
      loading: false,
      error: "Error al cargar promociones",
      eliminarPromocion: vi.fn(),
      desactivarPromocion: vi.fn(),
    });
    
    renderWithProviders(<Promociones />);
    
    // Verificamos que aparezca el mensaje de error
    expect(screen.getByText("Error al cargar promociones")).toBeInTheDocument();
  });

  // Test: Verifica navegación al hacer clic en "Volver Atrás"
  it("navega hacia atrás al hacer clic en 'Volver Atrás'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Promociones />);
    
    const backButton = screen.getByRole("button", { name: /volver atrás/i });
    await user.click(backButton);
    
    // Verificamos que navigate haya sido llamado con -1 (volver atrás)
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // Test: Verifica que se muestre el modal de crear promoción
  it("muestra el modal de crear promoción al hacer clic en 'Crear Promoción'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Promociones />);
    
    const createButton = screen.getByRole("button", { name: /crear promoción/i });
    await user.click(createButton);
    
    // Verificamos que el modal aparezca (asumiendo que CrearPromocion renderiza algo detectable, ej. un título)
    // Nota: Si CrearPromocion no tiene un texto único, ajusta según su contenido real
    expect(screen.getByText(/crear promoción/i)).toBeInTheDocument(); // O el texto específico del modal
  });

  // Test: Verifica que se muestre el modal de editar promoción
  it("muestra el modal de editar promoción al hacer clic en 'Editar'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Promociones />);
    
    const editButton = screen.getByRole("button", { name: /editar/i }); // El primer botón de editar
    await user.click(editButton);
    
    // Verificamos que el modal aparezca (asumiendo que EditarPromocion renderiza algo detectable)
    expect(screen.getByText(/editar promoción/i)).toBeInTheDocument(); // O el texto específico del modal
  });

  // Test: Verifica llamada a desactivarPromocion
  it("llama a desactivarPromocion al hacer clic en 'Desactivar'", async () => {
    const mockDesactivar = vi.fn();
    // Mockeamos para inyectar la función mock
    vi.mocked(vi.importMock('../../contexts/PromocionesContext')).usePromociones.mockReturnValue({
      promociones: [
        { id_promocion: 1, descripcion: "Descuento 10%", descuento: 10, tipo_descuento: "porcentaje", activo: true },
      ],
      loading: false,
      error: null,
      eliminarPromocion: vi.fn(),
      desactivarPromocion: mockDesactivar,
    });
    
    const user = userEvent.setup();
    renderWithProviders(<Promociones />);
    
    const deactivateButton = screen.getByRole("button", { name: /desactivar/i });
    await user.click(deactivateButton);
    
    // Verificamos que la función haya sido llamada con el ID correcto
    expect(mockDesactivar).toHaveBeenCalledWith(1);
  });

  // Test: Verifica llamada a eliminarPromocion
  it("llama a eliminarPromocion al hacer clic en 'Eliminar'", async () => {
    const mockEliminar = vi.fn();
    // Mockeamos para inyectar la función mock
    vi.mocked(vi.importMock('../../contexts/PromocionesContext')).usePromociones.mockReturnValue({
      promociones: [
        { id_promocion: 1, descripcion: "Descuento 10%", descuento: 10, tipo_descuento: "porcentaje", activo: true },
      ],
      loading: false,
      error: null,
      eliminarPromocion: mockEliminar,
      desactivarPromocion: vi.fn(),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<Promociones />);
    
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    await user.click(deleteButton);
    
    // Verificamos que la función haya sido llamada con el ID correcto
    expect(mockEliminar).toHaveBeenCalledWith(1);
  });
});