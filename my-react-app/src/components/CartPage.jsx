import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function CartPage() {
  const { cart, removeFromCart, increment, decrement, setQuantity, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [checkoutError, setCheckoutError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (item, value) => {
    let qty = Number(value);
    if (isNaN(qty) || qty < 1) qty = 1;
    setQuantity(item.id, qty);
    setErrors(e => {
      if (qty > item.stock) {
        return { ...e, [item.id]: `Only ${item.stock} items are available in stock.` };
      } else {
        const { [item.id]: removed, ...rest } = e;
        return rest;
      }
    });
  };

  const handleCheckout = async () => {
    let hasError = false;
    const newErrors = {};
    for (const item of cart) {
      if (item.quantity > item.stock) {
        newErrors[item.id] = `Only ${item.stock} items are available in stock.`;
        hasError = true;
      }
    }
    setErrors(newErrors);
    setCheckoutError(hasError);
    if (hasError) return;
    setLoading(true);
    try {
      // Atomically update stock for each product
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        // Get latest stock
        const snap = await getDoc(productRef);
        const currentStock = snap.data().stock;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(productRef, { stock: newStock });
      }
      setSuccess(true);
      clearCart();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to complete purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <button
          className="self-start mb-4 text-indigo-600 hover:underline font-medium"
          onClick={() => navigate(-1)}
        >
          ← Back to Products
        </button>
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">Your Cart</h2>
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">Cart is empty.</div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                  <div className="text-gray-500 text-sm">{item.brand}</div>
                  <div className="text-indigo-600 font-bold">₹{item.price}</div>
                  {errors[item.id] && (
                    <div className="text-red-500 text-sm mt-1">{errors[item.id]}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button onClick={() => decrement(item.id)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item, e.target.value)}
                    className="w-24 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-indigo-500 text-base"
                    style={{ MozAppearance: 'textfield' }}
                  />
                  <button onClick={() => increment(item.id)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 w-full border-t pt-4">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>
          {success && (
            <div className="w-full mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center animate-fadeIn">
              Purchase successful 🎉
            </div>
          )}
          <button
            className="w-full mb-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition text-lg"
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
          <button
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md shadow-md transition"
            disabled={cart.length === 0}
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
} 