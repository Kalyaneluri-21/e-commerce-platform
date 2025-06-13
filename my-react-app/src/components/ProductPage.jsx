import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from './CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-xl">Product not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-2">
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg text-lg animate-fadeIn">
          Product added to cart ✅
        </div>
      )}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <button
          className="self-start mb-4 text-indigo-600 hover:underline font-medium"
          onClick={() => navigate(-1)}
        >
          ← Back to Products
        </button>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-72 w-full object-contain rounded mb-6 bg-gray-50"
          onError={e => (e.target.src = 'https://via.placeholder.com/300?text=No+Image')}
        />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{product.title}</h1>
        <div className="text-indigo-600 font-bold text-xl mb-1">₹{product.price}</div>
        <div className="text-gray-500 text-base mb-4">{product.brand}</div>
        <div className="text-gray-700 text-base mb-6 text-center whitespace-pre-line">{product.description}</div>
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition text-lg"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
} 