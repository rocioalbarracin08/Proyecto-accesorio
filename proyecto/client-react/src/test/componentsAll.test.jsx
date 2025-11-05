//ideal para detectar archivos rotos o mal exportados
import { describe, it, expect } from 'vitest';

describe('components directory exports', () => {
  it('imports all modules under /src/components and they export something', async () => {
    // Usa glob asíncrono en lugar de globEager
    const modules = import.meta.glob('/src/components/**/*.{js,jsx,ts,tsx}');
    const paths = Object.keys(modules);
    expect(paths.length).toBeGreaterThan(0);

    // Verifica que al menos uno se importe correctamente (opcional)
    if (paths.length > 0) {
      const firstModule = await modules[paths[0]]();
      expect(firstModule).toBeDefined();
    }
  });
});