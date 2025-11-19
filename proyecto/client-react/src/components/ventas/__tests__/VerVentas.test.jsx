import React from "react";
import { renderWithMockProviders, screen, waitFor } from "../../test/test-utils";
import { vi, describe, it, expect } from "vitest";
import HistorialVentas from "../HistorialVentas"; // Ajusta la ruta según tu estructura

// Mockea el contexto AuthContext para controlar isLogged, userRole, authChecked
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importa el mock para poder configurarlo en cada test
import { useAuthContext } from "../../contexts/AuthContext";

describe("", ()=>{
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock básico para fetch (se reasignará en tests específicos)
    global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: async () => ({
        ventas: [
            {
            id_factura: 1,
            fecha: "2023-10-01",
            hora: "10:00",
            nombre_tienda: "Tienda A",
            metodo_pago: "Efectivo",
            costo_total: 100,
            productos: "Producto 1, Producto 2",
            },
        ],
        total_pages: 2,
        }),
      })
    );
  });
  it("Muestra error si falla la carga de ventas", async () => {
    // Configura el mock: empleado logueado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      authChecked: true,
    });

    // Mockea fetch para simular error
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: "Error al cargar ventas" }),
      })
    );

    renderWithMockProviders(<HistorialVentas />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar historial de ventas/i)).toBeInTheDocument();
    });
  });

  it("Muestra error si hay problema de conexión (fetch reject)", async () => {
    // Configura el mock: empleado logueado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      authChecked: true,
    });

    // Mockea fetch para rechazar
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    renderWithMockProviders(<HistorialVentas />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar historial de ventas/i)).toBeInTheDocument();
    });
  });

  it("Cambia de página correctamente", async () => {
    // Configura el mock: empleado logueado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      authChecked: true,
    });

    // Mockea fetch para página 1 inicialmente
    let callCount = 0;
    global.fetch = vi.fn(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          ventas: [
            {
              id_factura: callCount === 1 ? 1 : 2,
              fecha: "2023-10-01",
              hora: "10:00",
              nombre_tienda: "Tienda A",
              metodo_pago: "Efectivo",
              costo_total: 100,
              productos: "Producto 1",
            },
          ],
          total_pages: 2,
        }),
      });
    });

    renderWithMockProviders(<HistorialVentas />);

    await waitFor(() => {
      expect(screen.getByText(/factura #1/i)).toBeInTheDocument();
    });

    // Haz click en "Siguiente"
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    nextButton.click();

    // Espera a que se recargue y verifique la nueva factura
    await waitFor(() => {
      expect(screen.getByText(/factura #2/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/página 2 de 2/i)).toBeInTheDocument();
  });

  it("No permite ir a página inválida", async () => {
    // Configura el mock: empleado logueado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      authChecked: true,
    });

    renderWithMockProviders(<HistorialVentas />);

    await waitFor(() => {
      expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();
    });

    // El botón "Anterior" debería estar deshabilitado en página 1
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });
})