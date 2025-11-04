// Este archivo contiene pruebas para el componente CrearPromocion.
// CrearPromocion permite a los usuarios crear nuevas promociones para productos.

// La primera prueba verifica que el formulario de creación de promociones se renderiza correctamente con el título esperado.
// La segunda prueba asegura que se muestran los campos de entrada necesarios para los detalles de la promoción, como el nombre y el descuento.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CrearPromocion from '../../components/promociones/CrearPromocion';

describe('CrearPromocion Component', () => {
  it('renders the create promotion form', () => {
    render(<CrearPromocion />);//"/i" pruebas flexibles, coincide con "Texto", "TEXTO", "texto", etc
    expect(screen.getByText(/crear nueva promoción/i)).toBeInTheDocument();
  });

  it('displays input fields for promotion details', () => {
    render(<CrearPromocion />);
    expect(screen.getByLabelText(/nombre de la promoción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descuento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar promoción/i })).toBeInTheDocument();
  });
});