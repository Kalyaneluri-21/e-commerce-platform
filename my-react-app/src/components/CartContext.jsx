import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { auth } from '../firebase';

const CartContext = createContext();

function getCartKey(uid) {
  return uid ? `cart_${uid}` : null;
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.cart || [];
    case 'ADD': {
      const exists = state.find(item => item.id === action.product.id);
      if (exists) {
        return state.map(item =>
          item.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.product, quantity: 1 }];
    }
    case 'REMOVE':
      return state.filter(item => item.id !== action.id);
    case 'INCREMENT':
      return state.map(item =>
        item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    case 'DECREMENT':
      return state.map(item =>
        item.id === action.id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    case 'SET_QUANTITY':
      return state.map(item =>
        item.id === action.id
          ? { ...item, quantity: action.quantity }
          : item
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [user, setUser] = React.useState(auth.currentUser);
  const prevUid = useRef();

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
    return unsubscribe;
  }, []);

  // Load cart from localStorage when user changes
  useEffect(() => {
    const uid = user?.uid;
    if (uid && prevUid.current !== uid) {
      const key = getCartKey(uid);
      const stored = key ? JSON.parse(localStorage.getItem(key)) : [];
      dispatch({ type: 'INIT', cart: stored || [] });
      prevUid.current = uid;
    }
    if (!uid) {
      dispatch({ type: 'INIT', cart: [] });
      prevUid.current = undefined;
    }
  }, [user]);

  // Sync cart to localStorage for current user
  useEffect(() => {
    const uid = user?.uid;
    const key = getCartKey(uid);
    if (key) {
      if (cart.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(cart));
      }
    }
  }, [cart, user]);

  const addToCart = product => dispatch({ type: 'ADD', product });
  const removeFromCart = id => dispatch({ type: 'REMOVE', id });
  const increment = id => dispatch({ type: 'INCREMENT', id });
  const decrement = id => dispatch({ type: 'DECREMENT', id });
  const setQuantity = (id, quantity) => dispatch({ type: 'SET_QUANTITY', id, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increment, decrement, setQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 