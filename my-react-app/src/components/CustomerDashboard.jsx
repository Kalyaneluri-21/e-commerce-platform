import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FiSearch } from 'react-icons/fi';
import { CartProvider } from './CartContext';
import CartIcon from './CartIcon';
import { useCart } from './CartContext';

const PRICE_RANGES = [
  { label: '₹10–₹100', min: 10, max: 100 },
  { label: '₹100–₹500', min: 100, max: 500 },
  { label: '₹500–₹1,000', min: 500, max: 1000 },
  { label: '₹1,000–₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000–₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 and above', min: 10000, max: Infinity },
];

function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Auth protection
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    (async () => {
      const snap = await getDocs(collection(db, 'products'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setFiltered(data);
      setCategories([...new Set(data.map(p => p.category).filter(Boolean))]);
      setLoading(false);
    })();
  }, []);

  // Real-time filter
  useEffect(() => {
    let filtered = products;
    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(search.trim().toLowerCase()));
    }
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    // Price filter
    if (selectedPrice) {
      const range = PRICE_RANGES.find(r => r.label === selectedPrice);
      if (range) {
        filtered = filtered.filter(p => Number(p.price) >= range.min && Number(p.price) <= range.max);
      }
    }
    setFiltered(filtered);
  }, [products, search, selectedCategory, selectedPrice]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      {/* Prominent Search Bar */}
      <nav className="bg-white shadow-lg w-full sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-indigo-700 tracking-tight">E-Shop</h1>
          </div>
          <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-2xl mx-auto w-full">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md flex items-center justify-center">
              <FiSearch size={22} />
            </button>
          </form>
          <div className="flex items-center gap-4">
            <CartIcon onClick={() => navigate('/cart')} />
            <button
              onClick={() => auth.signOut()}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8 w-full">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8 w-full flex flex-col md:flex-row md:items-center gap-4">
          {/* Category Filter */}
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-medium mb-1">Category</label>
            <select
              className="border rounded px-3 py-2 min-w-[180px]"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Price Range Filter */}
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-medium mb-1">Price Range</label>
            <select
              className="border rounded px-3 py-2 min-w-[180px]"
              value={selectedPrice}
              onChange={e => setSelectedPrice(e.target.value)}
            >
              <option value="">All</option>
              {PRICE_RANGES.map(range => (
                <option key={range.label} value={range.label}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16 text-lg">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No products found for the selected filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-200">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-40 w-full object-contain mb-4 rounded"
                  onError={e => (e.target.src = 'https://via.placeholder.com/150?text=No+Image')}
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center w-full truncate">{product.title}</h3>
                <div className="text-indigo-600 font-bold text-lg mb-1">₹{product.price}</div>
                <div className="text-gray-500 text-sm mb-2">{product.brand}</div>
                <button
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition text-base"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Product
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <CartProvider>
      <DashboardContent />
    </CartProvider>
  );
} 