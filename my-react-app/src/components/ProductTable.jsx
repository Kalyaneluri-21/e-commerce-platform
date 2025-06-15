import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FiEdit2, FiChevronUp, FiChevronDown, FiFilter, FiTrash2 } from 'react-icons/fi';

function Badge({ children }) {
  return <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{children}</span>;
}

function SortIcon({ active, order }) {
  return active ? (
    order === 'asc' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />
  ) : (
    <span className="inline-block w-4" />
  );
}

function FilterDropdown({ label, icon, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">All {label}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function ProductTable({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('stock');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const vendorId = auth.currentUser?.uid;

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    setError('');
    (async () => {
      let q = query(
        collection(db, 'products'),
        where('vendorId', '==', vendorId)
      );
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (category) {
        data = data.filter(p => p.category === category);
      }
      data = data.sort((a, b) => {
        if (sortBy === 'price' || sortBy === 'stock') {
          return sortOrder === 'asc'
            ? Number(a[sortBy]) - Number(b[sortBy])
            : Number(b[sortBy]) - Number(a[sortBy]);
        }
        return 0;
      });
      setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_SIZE)));
      const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      setProducts(paged);
      setCategories([...new Set(snapshot.docs.map(doc => doc.data().category).filter(Boolean))]);
      setLoading(false);
    })();
  }, [vendorId, page, category, sortBy, sortOrder, deletingId]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      // If you cache products in localStorage, remove here as well
      // localStorage.removeItem(`product_${id}`);
      setProducts(products => products.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  // Scroll Add Product form into view on edit
  const handleEdit = (product) => {
    if (typeof window !== 'undefined') {
      const form = document.getElementById('add-product-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onEdit(product);
  };

  return (
    <div className="w-full mt-10 font-sans">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <FilterDropdown
            label="Category"
            icon={<FiFilter className="text-gray-400" />}
            value={category}
            onChange={setCategory}
            options={categories}
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium text-gray-700">Sort by:</span>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border ${sortBy === 'stock' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600'} transition`}
            onClick={() => handleSort('stock')}
          >
            Stock <SortIcon active={sortBy === 'stock'} order={sortOrder} />
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border ${sortBy === 'price' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600'} transition`}
            onClick={() => handleSort('price')}
          >
            Price <SortIcon active={sortBy === 'price'} order={sortOrder} />
          </button>
        </div>
      </div>
      <div className="rounded-2xl shadow-xl bg-white max-w-full overflow-x-hidden">
        <table className="w-full max-w-full text-sm table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Image</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700 max-w-[160px] truncate">Title</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('price')}>
                Price (₹)
                <SortIcon active={sortBy === 'price'} order={sortOrder} />
              </th>
              <th className="px-4 py-3 text-left font-bold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('stock')}>
                Stock
                <SortIcon active={sortBy === 'stock'} order={sortOrder} />
              </th>
              <th className="px-4 py-3 text-left font-bold text-gray-700 max-w-[220px] truncate">Description</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700 max-w-[180px] truncate">Image URL</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center text-red-500 py-8">{error}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">No products found.</td></tr>
            ) : (
              products.map((product, idx) => (
                <tr key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-12 w-12 object-contain rounded bg-gray-100 border border-gray-200"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/48?text=No+Image'; }}
                      />
                    ) : (
                      <span className="inline-block h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z" /></svg>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[160px]">{product.title}</td>
                  <td className="px-4 py-3"><Badge>{product.category}</Badge></td>
                  <td className="px-4 py-3">₹{Number(product.price).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate">{product.description}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate">{product.imageUrl}</td>
                  <td className="px-4 py-3 flex gap-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm font-semibold transition"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-red-400 text-red-500 hover:bg-red-50 rounded-lg shadow-sm font-semibold transition"
                      disabled={deletingId === product.id}
                    >
                      <FiTrash2 /> {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">Page {page} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
} 