import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from './CartContext';

export default function CartIcon({ onClick }) {
  const { cart } = useCart();
  const uniqueCount = cart.length;
  return (
    <button className="relative" onClick={onClick} aria-label={`Cart with ${uniqueCount} unique items`}>
      <FiShoppingCart size={28} className="text-indigo-700" />
      {uniqueCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {uniqueCount}
        </span>
      )}
    </button>
  );
} 