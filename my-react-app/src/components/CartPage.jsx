import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cart, removeFromCart, increment, decrement, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const navigate = useNavigate();

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
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button onClick={() => decrement(item.id)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <span>{item.quantity}</span>
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
          <button
            className="w-full mb-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition text-lg"
            disabled={cart.length === 0}
            onClick={() => alert('Checkout is not implemented yet.')}
          >
            Checkout
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