// /test/setupTests.jsx - Setup global para Vitest
// Este archivo se ejecuta antes de todas las pruebas. Aquí van polyfills y configuraciones globales.

import { expect, afterEach } from 'vitest';  // Importa lo básico de Vitest
import { cleanup } from '@testing-library/react';  // Limpia después de cada test
import '@testing-library/jest-dom';  // Agrega matchers como toBeInTheDocument

// Limpia el DOM después de cada prueba para evitar interferencias
afterEach(() => {
  cleanup();
});

// Polyfill para window.matchMedia (útil para carruseles o componentes que lo usan)
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {}, // deprecated
      removeListener: function () {}, // deprecated
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false; },
    };
  };
}

// Polyfill para MutationObserver (si algún componente lo requiere)
if (typeof window !== 'undefined' && typeof window.MutationObserver === 'undefined') {
  window.MutationObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
  };
}

// Polyfill para requestAnimationFrame (algunas librerías lo esperan)
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = function (cb) {
    return setTimeout(cb, 0);
  };
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

// Stub global para fetch (evita errores si no mockeás fetch en cada test)
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({}),
    text: async () => '',
  });
}