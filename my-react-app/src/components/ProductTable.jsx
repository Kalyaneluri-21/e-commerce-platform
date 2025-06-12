import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// ProductRow subcomponent
function ProductRow({ product, isEditing, onEdit, onChange, onSave, onCancel }) {
  const [editData, setEditData] = useState(product);

  useEffect(() => {
    setEditData(product);
  }, [product]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  return (
    <tr className="bg-white border-b hover:bg-gray-50">
      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
        {isEditing ? (
          <input name="title" value={editData.title} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
        ) : product.title}
      </td>
      <td className="px-4 py-2 text-sm">{isEditing ? (
        <input name="category" value={editData.category} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      ) : product.category}</td>
      <td className="px-4 py-2 text-sm">{isEditing ? (
        <input name="price" type="number" value={editData.price} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      ) : `$${product.price}`}</td>
      <td className="px-4 py-2 text-sm">{isEditing ? (
        <input name="stock" type="number" value={editData.stock} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      ) : product.stock}</td>
      <td className="px-4 py-2 text-sm max-w-xs truncate">{isEditing ? (
        <input name="description" value={editData.description} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      ) : product.description}</td>
      <td className="px-4 py-2 text-sm">
        <img src={product.imageUrl} alt={product.title} className="h-12 w-12 object-cover rounded" />
      </td>
      <td className="px-4 py-2 text-sm">
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={() => onSave(editData)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Save</button>
            <button onClick={onCancel} className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400">Cancel</button>
          </div>
        ) : (
          <button onClick={onEdit} className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600">Edit</button>
        )}
      </td>
    </tr>
  );
}

// Pagination subcomponent
function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-gray-700">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

// FilterControls subcomponent
function FilterControls({ category, setCategory, sortBy, setSortBy, sortOrder, setSortOrder, categories }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
      <div>
        <label className="mr-2 font-medium">Category:</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mr-2 font-medium">Sort by:</label>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="stock">Stock</option>
          <option value="price">Price</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="ml-2 px-2 py-1 border rounded bg-gray-100"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('stock');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);

  const vendorId = auth.currentUser?.uid;

  // Fetch products
  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        let q = query(
          collection(db, 'products'),
          where('vendorId', '==', vendorId)
        );
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Category filter
        if (category) {
          data = data.filter(p => p.category === category);
        }
        // Sorting
        data = data.sort((a, b) => {
          if (sortBy === 'price' || sortBy === 'stock') {
            return sortOrder === 'asc'
              ? Number(a[sortBy]) - Number(b[sortBy])
              : Number(b[sortBy]) - Number(a[sortBy]);
          }
          return 0;
        });
        // Pagination
        setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_SIZE)));
        const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        setProducts(paged);
        // Unique categories
        setCategories([...new Set(snapshot.docs.map(doc => doc.data().category).filter(Boolean))]);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    })();
  }, [vendorId, page, category, sortBy, sortOrder]);

  // Edit handlers
  const handleEdit = (id) => setEditingId(id);
  const handleCancel = () => setEditingId(null);
  const handleSave = async (editData) => {
    try {
      await updateDoc(doc(db, 'products', editData.id), {
        ...editData,
        price: Number(editData.price),
        stock: Number(editData.stock),
      });
      setEditingId(null);
      // Refresh products
      setPage(1); // To force reload
    } catch {
      setError('Failed to save changes.');
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Your Products</h3>
      <FilterControls
        category={category}
        setCategory={setCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
      />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No products found.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left cursor-pointer">Price</th>
                <th className="px-4 py-2 text-left cursor-pointer">Stock</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isEditing={editingId === product.id}
                  onEdit={() => handleEdit(product.id)}
                  onChange={() => {}}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
} 