import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial del carrito
const initialState = {
  items: {},          // Productos agrupados por id_producto base
  totalItems: 0,      // Total de productos
  totalPrice: 0,      // Precio total
  showCarrito: false  // Control del modal del carrito
};

// Reducer
const carritoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto, id } = action.payload;
      const baseId = id || producto.id_producto || producto.id || producto._id || producto.codigo;
      const colorId = producto.selectedColor?.id_color;

      const existingItem = state.items[baseId];
      const precio = parseFloat(producto.precio || 0);

      const productoConColores = {
        ...producto,
        colores: producto.colores || []
      };

      if (existingItem) {
        // Incrementa cantidad del color seleccionado
        const newColorQuantities = { ...existingItem.colorQuantities };
        newColorQuantities[colorId] = (newColorQuantities[colorId] || 0) + 1;

        const newTotalCantidad = Object.values(newColorQuantities).reduce((sum, qty) => sum + qty, 0);

        return {
          ...state,
          items: {
            ...state.items,
            [baseId]: {
              ...existingItem,
              colorQuantities: newColorQuantities,
              totalCantidad: newTotalCantidad
            }
          },
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + precio
        };
      } else {
        // Nuevo producto
        const colorQuantities = colorId ? { [colorId]: 1 } : {};
        return {
          ...state,
          items: {
            ...state.items,
            [baseId]: {
              producto: productoConColores,
              colorQuantities,
              totalCantidad: 1
            }
          },
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + precio
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      // Actualiza cantidad total del producto (simplificado)
      const { productoId: pid, quantity } = action.payload;
      const item = state.items[pid];
      if (!item) return state;

      const delta = quantity - item.totalCantidad;
      const precioItem = parseFloat(item.producto.precio || 0);

      if (quantity <= 0) {
        const { [pid]: _, ...newItems } = state.items;
        return {
          ...state,
          items: newItems,
          totalItems: Math.max(0, state.totalItems - item.totalCantidad),
          totalPrice: Math.max(0, state.totalPrice - (item.totalCantidad * precioItem))
        };
      }

      return {
        ...state,
        items: {
          ...state.items,
          [pid]: { ...item, totalCantidad: quantity }
        },
        totalItems: Math.max(0, state.totalItems + delta),
        totalPrice: Math.max(0, state.totalPrice + (delta * precioItem))
      };
    }

    case 'REMOVE_ITEM': {
      const { removeId } = action.payload;
      const removeItem = state.items[removeId];
      if (!removeItem) return state;

      const { [removeId]: _, ...newItems } = state.items;
      const precioRemove = parseFloat(removeItem.producto.precio || 0);

      return {
        ...state,
        items: newItems,
        totalItems: Math.max(0, state.totalItems - removeItem.totalCantidad),
        totalPrice: Math.max(0, state.totalPrice - (removeItem.totalCantidad * precioRemove))
      };
    }

    case 'ADD_COLOR_QUANTITY': {
      const { productoId: pid, colorId } = action.payload;
      const item = state.items[pid];
      if (!item) return state;

      const newColorQuantities = { ...item.colorQuantities };
      newColorQuantities[colorId] = (newColorQuantities[colorId] || 0) + 1;
      const newTotalCantidad = Object.values(newColorQuantities).reduce((sum, qty) => sum + qty, 0);
      const precioItem = parseFloat(item.producto.precio || 0);

      return {
        ...state,
        items: {
          ...state.items,
          [pid]: {
            ...item,
            colorQuantities: newColorQuantities,
            totalCantidad: newTotalCantidad
          }
        },
        totalItems: state.totalItems + 1,
        totalPrice: state.totalPrice + precioItem
      };
    }

    case 'REMOVE_COLOR_QUANTITY': {
      const { productoId: pid, colorId } = action.payload;
      const item = state.items[pid];
      if (!item || !item.colorQuantities[colorId]) return state;

      const newColorQuantities = { ...item.colorQuantities };
      newColorQuantities[colorId] -= 1;
      if (newColorQuantities[colorId] <= 0) delete newColorQuantities[colorId];
      const newTotalCantidad = Object.values(newColorQuantities).reduce((sum, qty) => sum + qty, 0);
      const precioItem = parseFloat(item.producto.precio || 0);

      if (newTotalCantidad <= 0) {
        // Eliminar el ítem si no quedan cantidades
        const { [pid]: _, ...newItems } = state.items;
        return {
          ...state,
          items: newItems,
          totalItems: Math.max(0, state.totalItems - item.totalCantidad),
          totalPrice: Math.max(0, state.totalPrice - (item.totalCantidad * precioItem))
        };
      }

      return {
        ...state,
        items: {
          ...state.items,
          [pid]: {
            ...item,
            colorQuantities: newColorQuantities,
            totalCantidad: newTotalCantidad
          }
        },
        totalItems: state.totalItems - 1,
        totalPrice: state.totalPrice - precioItem
      };
    }

    case 'TOGGLE_CART':
      return { ...state, showCarrito: !state.showCarrito };

    case 'CLOSE_CART':
      return { ...state, showCarrito: false };

    case 'CLEAR_CART':
      return { ...initialState, showCarrito: state.showCarrito };

    case 'UPDATE_ITEM': {
      const { productoId: upId, updates } = action.payload || {};
      if (!upId || !state.items[upId]) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [upId]: { ...state.items[upId], ...updates }
        }
      };
    }

    case 'OPEN_CART':
      return { ...state, showCarrito: true };

    default:
      return state;
  }
};

// Contexto y Provider
const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);

  // Restaurar carrito desde localStorage (ajusta para nueva estructura)
  useEffect(() => {
    const saved = localStorage.getItem('carrito');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed.items || {}).forEach(id => {
          const item = parsed.items[id];
          const productoConColores = {
            ...item.producto,
            colores: item.producto?.colores || []
          };
          // Reconstruye agregando por color
          Object.keys(item.colorQuantities || {}).forEach(colorId => {
            const qty = item.colorQuantities[colorId];
            for (let i = 0; i < qty; i++) {
              dispatch({
                type: 'ADD_ITEM',
                payload: { 
                  producto: productoConColores, 
                  id 
                }
              });
            }
          });
        });
      } catch (e) {
        console.error('Error cargando carrito:', e);
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(
      'carrito',
      JSON.stringify({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      })
    );
  }, [state.items, state.totalItems, state.totalPrice]);

  // Funciones para el contexto
  const addItem = (producto) => {
    console.log("Producto recibido en addItem:", producto);
    console.log("selectedColor en producto:", producto.selectedColor);
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        producto: {
          ...producto,
          colores: producto.colores || []
        }
      }
    });
  };

  const updateQuantity = (productoId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productoId, quantity } });

  const updateItem = (productoId, updates) =>
    dispatch({ type: 'UPDATE_ITEM', payload: { productoId, updates } });

  const removeItem = (productoId) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { removeId: productoId } });

  const addColorQuantity = (productoId, colorId) =>
    dispatch({ type: 'ADD_COLOR_QUANTITY', payload: { productoId, colorId } });

  const removeColorQuantity = (productoId, colorId) =>
    dispatch({ type: 'REMOVE_COLOR_QUANTITY', payload: { productoId, colorId } });

  const openCarrito = () => dispatch({ type: 'OPEN_CART' });

  const toggleCarrito = () => dispatch({ type: 'TOGGLE_CART' });

  const closeCarrito = () => dispatch({ type: 'CLOSE_CART' });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CarritoContext.Provider
      value={{
        state,
        addItem,
        updateQuantity,
        updateItem,
        removeItem,
        openCarrito,
        toggleCarrito,
        closeCarrito,
        clearCart,
        addColorQuantity,
        removeColorQuantity
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};