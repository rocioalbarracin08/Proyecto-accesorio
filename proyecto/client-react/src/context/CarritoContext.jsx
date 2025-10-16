import { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial (agregué showCarrito para modal)
const initialState = {
  items: {},          // o [] si preferís usar array
  totalItems: 0,
  totalPrice: 0,
  showCarrito: false
};

// Reducer (agregué TOGGLE_CART y CLOSE_CART)
//función que decide cómo cambia el estado del carrito según una acción
const carritoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const { producto, id } = action.payload;
      const productoId = id || producto.id_producto || producto.id || producto._id || producto.codigo;  // Soporte para id_producto
      const existingItem = state.items[productoId];
      const precio = parseFloat(producto.precio || 0);
      
      if (existingItem) { //Verificar si ya esta el producto en el carrito
        return {
          ...state,
          items: {
            ...state.items, //Se le agrega lo anterior (estado anterior)
            [productoId]: {
              ...existingItem,
              cantidad: existingItem.cantidad + 1 //A la cantidad se le agrega 1
            } //Al carrito se le agrega el nuevo producto
          },
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + precio
        };
      } else {
        return {
          ...state,
          items: {
            ...state.items,
            [productoId]: { producto, cantidad: 1 } //Valor inicial de la cantidad
          },
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + precio
        };
      }

    case 'UPDATE_QUANTITY': 
      const { productoId: pid, quantity } = action.payload; //datos que vienen con la acción
      //ID del producto (pid) y la nueva cantidad (quantity)

      const item = state.items[pid]; //Busca el producto en el carrito.
      if (!item) return state; //Si no existe, no hace nada y devuelve el mismo estado.

      const delta = quantity - item.cantidad; //Calcula cuánto cambió la cantidad.
      const precioItem = parseFloat(item.producto.precio || 0); //Convierte el precio del producto a número. Si no hay precio, usa 0.

      if (quantity <= 0) {
        // Esto elimina el producto del carrito: Si la cantidad es 0 o >
        const { [pid]: _, ...newItems } = state.items;
        return {
          ...state,
          items: newItems,
          //Math.max(0, ...): evita que el total quede negativo.
          totalItems: Math.max(0, state.totalItems - item.cantidad), 
          totalPrice: Math.max(0, state.totalPrice - (item.cantidad * precioItem))
        };
      }
      return {
        /*
        Actualiza el carrito con la nueva cantidad:
          Modifica solo ese producto (pid).
          Ajusta el total de ítems según cuánto cambió (delta).
          Ajusta el precio total según el cambio (delta * precioItem). 
        */
        ...state,
        items: {
          ...state.items,
          [pid]: { ...item, cantidad: quantity }
        },
        totalItems: Math.max(0, state.totalItems + delta), //Delta: diferencia
        totalPrice: Math.max(0, state.totalPrice + (delta * precioItem))
        //usa delta para actualizar los totales sin tener que recalcular todo el carrito desde cero
      };

    case 'REMOVE_ITEM': //Elimina un producto del carrito.
      const { removeId } = action.payload;
      const removeItem = state.items[removeId];
      if (!removeItem) return state; //Si no esta no hace nada

      // Saca ese producto del objeto 'items'
      const { [removeId]: _, ...newItems } = state.items;
      const precioRemove = parseFloat(removeItem.producto.precio || 0);

      // Devuelve el nuevo estado SIN ese producto
      return {
        ...state,
        items: newItems,
        totalItems: Math.max(0, state.totalItems - removeItem.cantidad),
        totalPrice: Math.max(0, state.totalPrice - (removeItem.cantidad * precioRemove))
      };

    //Abre o cierra el modal del carrito.
    case 'TOGGLE_CART':
      return { ...state, showCarrito: !state.showCarrito };
      //Si está cerrado (false) → lo abre (true),
      //Si está abierto (true) → lo cierra (false).

    //Cierra el modal sí o sí.
    case 'CLOSE_CART':
      return { ...state, showCarrito: false };

    //Vacía el carrito completamente.
    case 'CLEAR_CART':
      return { ...initialState, showCarrito: state.showCarrito };  // Limpia items, mantiene modal

    default://Si llega otra accion no esperada
      return state;//“No sé qué me pedís, así que no toco nada.”
  }
};

//#########################################################################

// Parte que crea, guarda y comparte el ESTADO DEL CARRITO 
const CarritoContext = createContext(); //crea un “contexto” global de React. | Util para no usar props

//CarritoProvider: componente envoltorio (wrapper). proveedor del contexto
export const CarritoProvider = ({ children }) => {

  //base del estado del carrito: En vez de usar useState, usa useReducer porque hay muchas acciones
  const [state, dispatch] = useReducer(carritoReducer, initialState);//dispatch(type: '...'): es para mandar una orden

  // Persistencia en localStorage (solo items, no modal)
  useEffect(() => {
    const saved = localStorage.getItem('carrito');//si recargás la página el carrito no se borra
    //LocalStorage guarda un diccionario con una palabras clave "carrito"

    if (saved) { //Busca si exist un carrito 
      try { //Si no existe
        const parsed = JSON.parse(saved);//lo convierte en JSON que antes era texto, guardado en localStorage

        //Object.keys(parsed.items) → obtiene todos los IDs de productos que había en el carrito, es un método de JavaScript que devuelve un array con todas las llaves (keys) de un objeto
        Object.keys(parsed.items || {}).forEach(id => { //recorre cada producto.

          const item = parsed.items[id];
          for (let i = 0; i < item.cantidad; i++) {
            //Esto recrea el carrito en memoria como si estuvieras agregando los productos uno por uno
            dispatch({ type: 'ADD_ITEM', payload: { producto: item.producto, id } });
            //para activar toda la lógica del reducer
          }
        });
      } catch (e) {
        //Captura cualquier error si JSON.parse falla o si los datos están mal.
        console.error('Error cargando carrito:', e);
      }
    }
  }, []);//se ejecuta una sola vez

  console.log("error")
  //Cada vez que cambia algo (items, cantidad o total), lo actualiza en el localStorage para tener el carrito reciente, con actualizaciones.
  useEffect(() => {

    //guarda ese texto bajo la clave 'carrito' en el navegador
    localStorage.setItem('carrito', JSON.stringify({ //convierte ese objeto a texto, porque localStorage solo guarda cadenas de texto.

      items: state.items, //los productos actuales del carrito
      totalItems: state.totalItems, //la cantidad total de productos
      totalPrice: state.totalPrice //el precio total
    }));
  }, [state.items, state.totalItems, state.totalPrice]);//este efecto se ejecuta cada vez que cambia alguno de estos valores.

  //funciones que despachan acciones
  //Para no recibir dispatch({ type: 'ADD_ITEM', ... }) todo el tiempo.
  const addItem = (producto) => dispatch({ type: 'ADD_ITEM', payload: { producto } }); //Agrega un producto
  
  const updateQuantity = (productoId, quantity) => { //Cambia la cantidad 
    if (quantity <= 0) {//(si llega a 0, lo elimina)
      dispatch({ type: 'REMOVE_ITEM', payload: { removeId: productoId } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productoId, quantity } });
    }
  };

  //Elimina el producto
  const removeItem = (productoId) => dispatch({ type: 'REMOVE_ITEM', payload: { removeId: productoId } });

  //Abre/cierra el carrito
  const toggleCarrito = () => dispatch({ type: 'TOGGLE_CART' });
  const closeCarrito = () => dispatch({ type: 'CLOSE_CART' });
  
  //Vacía todo el carrito
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    //Esto provee el contexto (los datos y funciones del carrito) a todos los componentes hijos
    <CarritoContext.Provider value={{ state, addItem, updateQuantity, removeItem, toggleCarrito, closeCarrito, clearCart }}>
      {children}
    </CarritoContext.Provider>
  );
};

//####################################################################
export const useCarrito = () => { //custom hook que facilita acceder al contexto.
  const context = useContext(CarritoContext);
  console.log("error",context)
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};