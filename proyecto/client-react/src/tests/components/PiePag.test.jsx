import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PiePag from '../../components/piePagina/PiePag';

describe('PiePag Component', () => {
  it('renders the footer section', () => {
    render(<PiePag />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays footer links', () => {
    render(<PiePag />);
    expect(screen.getByText(/términos y condiciones/i)).toBeInTheDocument();
    expect(screen.getByText(/política de privacidad/i)).toBeInTheDocument();
  });
});