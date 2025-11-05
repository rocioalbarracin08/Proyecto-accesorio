import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardEmpleado from '../DashboardEmpleado'
import { BrowserRouter } from 'react-router-dom'

//Mock del contexto de autenticación
vi.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    isLogged: true,
    userRole: 'empleado',
    logout: vi.fn(),
  }),
}))

//Mock de los componentes hijos (para no depender de ellos)
vi.mock('../../producto/Productos', () => ({
  Productos: () => <div>Componente Productos</div>,
}))
vi.mock('../../ventas/RegistrarVenta', () => ({
  default: () => <div>Componente RegistrarVenta</div>,
}))
vi.mock('../../ventas/HistorialVentas', () => ({
  default: () => <div>Componente HistorialVentas</div>,
}))

//Mock global de fetch para evitar llamadas reales
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
)

describe('DashboardEmpleado Component', () => {
  it('renderiza correctamente el panel principal', async () => {
    render(
      <BrowserRouter>
        <DashboardEmpleado />
      </BrowserRouter>
    )

    // Verifica el título principal
    expect(screen.getByText(/panel de empleado/i)).toBeInTheDocument()

    // Verifica los botones de navegación
    expect(screen.getByRole('button', { name: /gestionar productos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrar venta/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver mis ventas/i })).toBeInTheDocument()

    // Verifica el link para volver
    expect(screen.getByRole('link', { name: /volver a inicio/i })).toBeInTheDocument()
  })

  it('muestra la sección de productos por defecto', () => {
    render(
      <BrowserRouter>
        <DashboardEmpleado />
      </BrowserRouter>
    )

    // Como el estado inicial es 'productos'
    expect(screen.getByText(/componente productos/i)).toBeInTheDocument()
  })
})
