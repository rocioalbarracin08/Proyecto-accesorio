import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import RegistrarEmpleado from '../RegistrarEmpleados'

// Mock del contexto
vi.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    isOwner: true, // Simula que el usuario es dueño
  }),
}))

// Mock de useNavigate para evitar redirecciones reales
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Mock global del fetch (evita llamadas reales)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
)

describe('RegistrarEmpleado Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente el formulario de registro', async () => {
    render(
      <BrowserRouter>
        <RegistrarEmpleado />
      </BrowserRouter>
    )

    // ✅ Verifica que el título principal exista
    expect(screen.getByText(/gestión de empleados/i)).toBeInTheDocument()

    // ✅ Busca inputs por placeholder
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/cree una contraseña/i)).toBeInTheDocument()

    // ✅ Verifica que el botón de registrar esté presente
    const button = screen.getByRole('button', { name: /registrar empleado/i })
    expect(button).toBeInTheDocument()
  })

  it('muestra el texto "Cargando tiendas..." mientras se cargan', () => {
    // Simulamos que fetch aún no devolvió datos
    global.fetch.mockImplementationOnce(() => new Promise(() => {})) // No resuelve

    render(
      <BrowserRouter>
        <RegistrarEmpleado />
      </BrowserRouter>
    )

    expect(screen.getByText(/cargando tiendas/i)).toBeInTheDocument()
  })
})
