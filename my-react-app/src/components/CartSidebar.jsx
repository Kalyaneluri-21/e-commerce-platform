import React from 'react';
import { useCart } from './CartContext';

export default function CartSidebar({ open, onClose }) {
  const { cart, removeFromCart, increment, decrement, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${open ? '' : 'pointer-events-none'}`}> 
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className={`relative w-full max-w-md bg-white h-full shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">Cart is empty.</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b py-3 gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                    <div className="text-gray-500 text-sm">{item.brand}</div>
                    <div className="text-indigo-600 font-bold">₹{item.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => decrement(item.id)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increment(item.id)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700">Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
            <button
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition text-lg"
              disabled={cart.length === 0}
              onClick={() => alert('Checkout is not implemented yet.')}
            >
              Checkout
            </button>
            <button
              className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md shadow-md transition"
              disabled={cart.length === 0}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 