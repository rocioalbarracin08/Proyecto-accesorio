import { useEffect } from 'react';

/**
 * Hook para navegación entre inputs en formularios usando Enter
 * Si el usuario presiona Enter en un input no final, mueve al siguiente
 * Si el usuario presiona Enter en el último input, ejecuta la función de submit
 * 
 * @param {Array<string>} inputRefs - Array de referencias a los inputs
 * @param {Function} onSubmit - Función a ejecutar cuando se presiona Enter en el último input
 */
export function useFormKeyboardNavigation(inputRefs, onSubmit) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        
        const currentInput = event.target;
        const currentIndex = inputRefs.findIndex(ref => ref.current === currentInput);
        
        if (currentIndex === -1) return; // El input no está en nuestro array
        
        // Si es el último input, ejecutar submit
        if (currentIndex === inputRefs.length - 1) {
          onSubmit && onSubmit();
        } else {
          // Si no es el último, ir al siguiente input
          const nextRef = inputRefs[currentIndex + 1];
          if (nextRef && nextRef.current) {
            nextRef.current.focus();
          }
        }
      }
    };

    // Agregar listener a cada input
    const listeners = inputRefs.map((ref) => {
      if (ref && ref.current) {
        ref.current.addEventListener('keydown', handleKeyDown);
        return { ref, handler: handleKeyDown };
      }
      return null;
    }).filter(Boolean);

    // Cleanup: remover listeners
    return () => {
      listeners.forEach(({ ref, handler }) => {
        if (ref && ref.current) {
          ref.current.removeEventListener('keydown', handler);
        }
      });
    };
  }, [inputRefs, onSubmit]);
}
