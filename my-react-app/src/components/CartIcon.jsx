import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from './CartContext';

export default function CartIcon({ onClick }) {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <button className="relative" onClick={onClick} aria-label="Cart">
      <FiShoppingCart size={28} className="text-indigo-700" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
          {count}
        </span>
      )}
    </button>
  );
} 