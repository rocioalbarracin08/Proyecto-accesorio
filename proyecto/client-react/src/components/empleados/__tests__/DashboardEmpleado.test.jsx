import React from 'react';
import { renderWithProviders, screen, waitFor, fireEvent } from '../../../test/test-utils';  // Usa renderWithProviders para incluir providers
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DashboardEmpleado from '../DashboardEmpleado';

// Mock del contexto de autenticación (ya lo tienes, pero asegúrate de que coincida)
vi.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    isLogged: true,
    userRole: 'empleado',
    logout: vi.fn(),  // Mock de logout
  }),
}));

// Mock de los componentes hijos (ajusta rutas si es necesario)
vi.mock('../../producto/Productos', () => ({
  Productos: () => <div>Componente Productos</div>,
}));
vi.mock('../../ventas/RegistrarVenta', () => ({
  default: () => <div>Componente RegistrarVenta</div>,
}));
vi.mock('../../ventas/HistorialVentas', () => ({
  default: () => <div>Componente HistorialVentas</div>,
}));

describe('DashboardEmpleado Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();  // Restaura mocks después de cada test
  });

  it('renderiza correctamente el panel principal', async () => {
    // Mock de fetch para perfil (devuelve datos simulados)
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id_tienda: 1 }),  // Simula perfil con tienda
        });
      }
      if (url.includes('/tienda/')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id_tienda: 1, nombre: 'Tienda Ejemplo' }]),  // Simula tienda
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    renderWithProviders(<DashboardEmpleado />);

    // Espera que cargue el perfil y tienda
    await waitFor(() => {
      expect(screen.getByText(/panel de empleado/i)).toBeInTheDocument();
    });

    // Verifica el título principal
    expect(screen.getByText(/panel de empleado/i)).toBeInTheDocument();

    // Verifica la tienda (debe mostrar "Tienda Ejemplo" después del fetch)
    expect(screen.getByText(/tienda: tienda ejemplo/i)).toBeInTheDocument();

    // Verifica los botones de navegación
    expect(screen.getByRole('button', { name: /gestionar productos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar venta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver mis ventas/i })).toBeInTheDocument();

    // Verifica el botón de cerrar sesión
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();

    // Verifica el link para volver (usa getByRole para links)
    expect(screen.getByRole('link', { name: /volver a inicio/i })).toBeInTheDocument();
  });

  it('muestra la sección de productos por defecto', async () => {
    // Mock de fetch (igual que arriba)
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id_tienda: 1 }),
        });
      }
      if (url.includes('/tienda/')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id_tienda: 1, nombre: 'Tienda Ejemplo' }]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    renderWithProviders(<DashboardEmpleado />);

    // Espera que cargue
    await waitFor(() => {
      expect(screen.getByText(/componente productos/i)).toBeInTheDocument();
    });

    // Verifica que muestre la sección por defecto (productos)
    expect(screen.getByText(/componente productos/i)).toBeInTheDocument();
  });

  it('cambia a la sección de ventas al hacer click', async () => {
    // Mock de fetch
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id_tienda: 1 }),
        });
      }
      if (url.includes('/tienda/')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id_tienda: 1, nombre: 'Tienda Ejemplo' }]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    renderWithProviders(<DashboardEmpleado />);

    // Espera que cargue
    await waitFor(() => {
      expect(screen.getByText(/componente productos/i)).toBeInTheDocument();
    });

    // Haz click en "Registrar Venta"
    fireEvent.click(screen.getByRole('button', { name: /registrar venta/i }));

    // Verifica que cambie a la sección de ventas
    expect(screen.getByText(/componente registrarventa/i)).toBeInTheDocument();
    expect(screen.queryByText(/componente productos/i)).not.toBeInTheDocument();
  });

  it('cambia a la sección de historial al hacer click', async () => {
    // Mock de fetch
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id_tienda: 1 }),
        });
      }
      if (url.includes('/tienda/')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id_tienda: 1, nombre: 'Tienda Ejemplo' }]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    renderWithProviders(<DashboardEmpleado />);

    // Espera que cargue
    await waitFor(() => {
      expect(screen.getByText(/componente productos/i)).toBeInTheDocument();
    });

    // Haz click en "Ver Mis Ventas"
    fireEvent.click(screen.getByRole('button', { name: /ver mis ventas/i }));

    // Verifica que cambie a la sección de historial
    expect(screen.getByText(/componente historialventas/i)).toBeInTheDocument();
    expect(screen.queryByText(/componente productos/i)).not.toBeInTheDocument();
  });

  it('llama a logout al hacer click en cerrar sesión', async () => {
    // Mock de fetch
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/usuarios/perfil')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id_tienda: 1 }),
        });
      }
      if (url.includes('/tienda/')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id_tienda: 1, nombre: 'Tienda Ejemplo' }]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    const mockLogout = vi.fn();
    vi.mocked(useAuthContext).mockReturnValue({
      isLogged: true,
      userRole: 'empleado',
      logout: mockLogout,
    });

    renderWithProviders(<DashboardEmpleado />);

    // Espera que cargue
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    });

    // Haz click en "Cerrar Sesión"
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    // Verifica que logout haya sido llamado
    expect(mockLogout).toHaveBeenCalled();
  });
});