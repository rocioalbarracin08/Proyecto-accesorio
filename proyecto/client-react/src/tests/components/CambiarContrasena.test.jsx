// Este archivo contiene pruebas para el componente CambiarContrasena.
// CambiarContrasena es un formulario que permite a los usuarios cambiar su contraseña actual.
// Usamos Vitest y React Testing Library para simular el renderizado y verificar el comportamiento.

import React from 'react';  // Importa React para usar JSX en pruebas
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';  // Para hooks de navegación como useNavigate
import { AuthProvider } from '../../contexts/AuthContext';  // Importa AuthProvider para proporcionar el contexto de autenticación
import { describe, it, expect } from 'vitest';
import CambiarContrasena from '../../components/cambiar-contrasena/CambiarContrasena';  // Ajusta la ruta si es necesario

describe('CambiarContrasena Component', () => {
  // Primera prueba: Verifica que el formulario se renderiza con todos los elementos necesarios.
  it('renders the password change form', () => {
    // Renderiza el componente envuelto en AuthProvider y BrowserRouter para proporcionar contextos necesarios.
    render(
      <BrowserRouter>
        <AuthProvider>
          <CambiarContrasena />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Busca los inputs por su placeholder (ya que no tienen labels asociados).
    expect(screen.getByPlaceholderText(/contraseña actual/i)).toBeInTheDocument();  // Verifica que el input de contraseña actual esté presente.
    expect(screen.getByPlaceholderText(/nueva contraseña/i)).toBeInTheDocument();  // Verifica que el input de nueva contraseña esté presente.
    expect(screen.getByPlaceholderText(/confirmar nueva contraseña/i)).toBeInTheDocument();  // Verifica que el input de confirmación esté presente.
    
    // Busca el botón por su texto exacto.
    expect(screen.getByRole('button', { name: /confirmar cambio/i })).toBeInTheDocument();  // Verifica que el botón de envío esté presente.
  });

  // Segunda prueba: Verifica que el botón esté habilitado inicialmente (ya que no hay lógica para deshabilitarlo por campos vacíos).
  it('enables the submit button initially', () => {
    // Renderiza el componente envuelto en AuthProvider y BrowserRouter.
    render(
      <BrowserRouter>
        <AuthProvider>
          <CambiarContrasena />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Busca el botón y verifica que esté habilitado (no deshabilitado).
    const submitButton = screen.getByRole('button', { name: /confirmar cambio/i });
    expect(submitButton).not.toBeDisabled();  // Confirma que el botón no está deshabilitado al inicio.
  });
});