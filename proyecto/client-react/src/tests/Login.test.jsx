import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { Login } from '../components/login/Login';

// Mock completo del módulo useAuth
vi.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    email: '',
    setEmail: vi.fn(),
    contraseña: '',
    setContraseña: vi.fn(),
    error: false,
    setError: vi.fn(),
    setLoginError: vi.fn(),
  }),
}));

describe('Login component', () => {
  it('Renderiza formulario y botón', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('Muestra error si email o contraseña están vacíos al hacer click', () => {
    // No necesitas mockear otra vez aquí, el mock global ya existe

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Busca el texto de error esperado que se muestra al hacer click con campos vacíos
    expect(screen.queryByText(/por favor, complete todos los campos/i)).toBeInTheDocument();
  });
});
