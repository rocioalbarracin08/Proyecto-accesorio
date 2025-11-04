import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PerfilUser from '../../components/perfilUsuario/PerfilUser';

describe('PerfilUser Component', () => {
  it('renders the user profile section', () => {
    render(<PerfilUser />);
    expect(screen.getByText(/perfil de usuario/i)).toBeInTheDocument();
  });

  it('displays user information', () => {
    render(<PerfilUser />);
    expect(screen.getByText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
  });
});