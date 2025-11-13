import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir providers
import { describe, it, expect, vi } from "vitest";
import CarruselPromociones from "../CarruselPromociones"; // Importamos el componente
import { usePromociones } from '../../contexts/PromocionesContext';

// Mockeamos usePromociones para controlar el estado del contexto
vi.mock('../../contexts/PromocionesContext', () => ({
  usePromociones: vi.fn(),
}));

// Helpers para mocks
const mockPromocionesActivas = [
  { id_promocion: 1, descripcion: "Descuento 10%", descuento: 10, tipo_descuento: "porcentaje", activo: true, fecha_fin: "2024-12-31", img_url: "/img1.jpg" },
  { id_promocion: 2, descripcion: "Envío gratis", descuento: 5, tipo_descuento: "fijo", activo: true, fecha_fin: "2024-12-31", img_url: "/img2.jpg" },
];

describe("CarruselPromociones Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // Restaura timers reales después de cada test
  });

  beforeEach(() => {
    usePromociones.mockReturnValue({
      promociones: mockPromocionesActivas,
      loading: false,
      error: null,
    });
  });
///////RAZONES POR LAS QUE NO SE MUESTRAN PROMOCIONES
  it("muestra loading mientras carga promociones", () => {
    usePromociones.mockReturnValue({
      promociones: [],
      loading: true,
      error: null,
    });

    renderWithProviders(<CarruselPromociones />);
    expect(screen.getByText("Cargando promociones...")).toBeInTheDocument();
  });

  it("muestra error si hay un error", () => {
    usePromociones.mockReturnValue({
      promociones: [],
      loading: false,
      error: "Error al cargar promociones",
    });

    renderWithProviders(<CarruselPromociones />);
    expect(screen.getByText("Error al cargar promociones")).toBeInTheDocument();
  });

  it("muestra mensaje si no hay promociones activas", () => {
    usePromociones.mockReturnValue({
      promociones: [],
      loading: false,
      error: null,
    });

    renderWithProviders(<CarruselPromociones />);
    expect(screen.getByText("No hay promociones activas")).toBeInTheDocument();
  });
  ////////////////////////////////////

  it("renderiza el carrusel con promociones activas", () => {
    renderWithProviders(<CarruselPromociones />);
    expect(screen.getByText("Descuento 10%")).toBeInTheDocument();
    expect(screen.getByText("Descuento: 10 (porcentaje)")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument(); // Indicador de texto
  });

  it("cambia automáticamente al siguiente índice cada 3 segundos", () => {
    vi.useFakeTimers(); // Usa timers falsos para controlar el tiempo
    renderWithProviders(<CarruselPromociones />);

    expect(screen.getByText("Descuento 10%")).toBeInTheDocument(); // Inicial: índice 0

    vi.advanceTimersByTime(3000); // Avanza 3 segundos
    expect(screen.getByText("Envío gratis")).toBeInTheDocument(); // Ahora índice 1

    vi.advanceTimersByTime(3000); // Avanza otros 3 segundos
    expect(screen.getByText("Descuento 10%")).toBeInTheDocument(); // Cicla de vuelta a índice 0
  });

  it("no inicia timer si no hay promociones activas", () => {
    usePromociones.mockReturnValue({
      promociones: [],
      loading: false,
      error: null,
    });

    vi.useFakeTimers();
    renderWithProviders(<CarruselPromociones />);

    vi.advanceTimersByTime(3000); // No debería cambiar nada
    expect(screen.getByText("No hay promociones activas")).toBeInTheDocument();
  });

  /*it("filtra promociones expiradas", () => {
    const promocionesConExpiradas = [
      { id_promocion: 1, descripcion: "Activa", activo: true, fecha_fin: "2024-12-31", img_url: "/img1.jpg" },
      { id_promocion: 2, descripcion: "Expirada", activo: true, fecha_fin: "2020-01-01", img_url: "/img2.jpg" }, // Expirada
    ];
    usePromociones.mockReturnValue({
      promociones: promocionesConExpiradas,
      loading: false,
      error: null,
    });

    renderWithProviders(<CarruselPromociones />);
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.queryByText("Expirada")).not.toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument(); // Solo una activa
  });*/
});