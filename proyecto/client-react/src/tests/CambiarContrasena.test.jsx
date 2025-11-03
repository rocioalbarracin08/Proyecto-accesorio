// Este archivo contiene pruebas para el componente CambiarContrasena.
// CambiarContrasena es un formulario que permite a los usuarios cambiar su contraseña actual.

// La primera prueba verifica que todos los campos del formulario (contraseña actual, nueva contraseña y confirmación) y el botón de envío se renderizan correctamente.
// La segunda prueba asegura que el botón de envío está deshabilitado si los campos requeridos están vacíos.

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CambiarContrasena from '../components/cambiar-contrasena/CambiarContrasena';

describe('CambiarContrasena Component', () => {
  it('renders the password change form', () => {
    render(<CambiarContrasena />);
    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('disables the submit button if required fields are empty', () => {
    render(<CambiarContrasena />);
    const submitButton = screen.getByRole('button', { name: /cambiar contraseña/i });
    expect(submitButton).toBeDisabled();
  });
});