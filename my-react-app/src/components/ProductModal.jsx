import React from 'react';

export default function ProductModal({ product, onAddToCart, onClose }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-56 w-full object-contain rounded mb-4 bg-gray-50"
            onError={e => (e.target.src = 'https://via.placeholder.com/300?text=No+Image')}
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{product.title}</h2>
          <div className="text-indigo-600 font-bold text-xl mb-1">₹{product.price}</div>
          <div className="text-gray-500 text-base mb-2">{product.brand}</div>
          <div className="text-gray-700 text-sm mb-4 text-center">{product.description}</div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition text-lg"
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 