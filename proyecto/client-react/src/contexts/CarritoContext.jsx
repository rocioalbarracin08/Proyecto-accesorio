import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial del carrito
const initialState = {
  items: {},          // Productos en el carrito
  totalItems: 0,      // Total de productos
  totalPrice: 0,      // Precio total
  showCarrito: false  // Control del modal del carrito
};

// Reducer
const carritoReducer = (state, action) => {
  switch (action.type) {

    case 'ADD_ITEM': {
      const { producto, id } = action.payload;
      const productoId = id || producto.id_producto || producto.id || producto._id || producto.codigo;
      const existingItem = state.items[productoId];
      const precio = parseFloat(producto.precio || 0);

      const productoConColores = {
        ...producto,
        colores: producto.colores || []
      };

      if (existingItem) {
        return {
          ...state,
          items: {
            ...state.items,
            [productoId]: {
              ...existingItem,
              cantidad: existingItem.cantidad + 1
            }
          },
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + precio
        };
      } else {
        return {
          ...state,
          items: {
            ...state.items,
            [productoId]: {
              producto: productoConColores,
              cantidad: 1,
              selectedColor: null
            }
          },
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + precio
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      const { productoId: pid, quantity } = action.payload;
      const item = state.items[pid];
      if (!item) return state;

      const delta = quantity - item.cantidad;
      const precioItem = parseFloat(item.producto.precio || 0);

      if (quantity <= 0) {
        const { [pid]: _, ...newItems } = state.items;
        return {
          ...state,
          items: newItems,
          totalItems: Math.max(0, state.totalItems - item.cantidad),
          totalPrice: Math.max(0, state.totalPrice - (item.cantidad * precioItem))
        };
      }

      return {
        ...state,
        items: {
          ...state.items,
          [pid]: { ...item, cantidad: quantity }
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
        totalItems: Math.max(0, state.totalItems - removeItem.cantidad),
        totalPrice: Math.max(0, state.totalPrice - (removeItem.cantidad * precioRemove))
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

  // Restaurar carrito desde localStorage
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
          for (let i = 0; i < item.cantidad; i++) {
            dispatch({
              type: 'ADD_ITEM',
              payload: { producto: productoConColores, id }
            });
          }
        });

        // Restaurar selectedColor u otros metadatos
        Object.keys(parsed.items || {}).forEach(id => {
          const item = parsed.items[id];
          const updates = {};
          Object.keys(item || {}).forEach(k => {
            if (k !== 'producto' && k !== 'cantidad') updates[k] = item[k];
          });
          if (Object.keys(updates).length > 0) {
            dispatch({ type: 'UPDATE_ITEM', payload: { productoId: id, updates } });
          }
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
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        producto: {
          ...producto,
          colores: producto.colores || [],
          selectedColor: null
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
        clearCart
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
