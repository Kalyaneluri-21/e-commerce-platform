import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ProductTable from './ProductTable';
import EditProductForm from './EditProductForm';

const initialForm = {
  title: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
  description: '',
  imageUrl: '',
};

const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [editingProduct, setEditingProduct] = useState(null);
  const [tableKey, setTableKey] = useState(0); // for forcing table refresh

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
    setFormSuccess('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Product title is required.';
    if (!form.category.trim()) return 'Category is required.';
    if (!form.brand.trim()) return 'Brand is required.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return 'Valid price is required.';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) return 'Valid stock is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.imageUrl.trim()) return 'Image URL is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        createdAt: serverTimestamp(),
        vendorId: auth.currentUser.uid,
      });
      setForm(initialForm);
      setFormSuccess('Product saved successfully!');
    } catch (err) {
      setFormError('Failed to save product. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => auth.signOut()}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200 w-full">
          <button
            className={`px-4 py-2 font-medium focus:outline-none transition border-b-2 ${activeTab === 'add' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
            onClick={() => setActiveTab('add')}
          >
            Add Product
          </button>
          <button
            className={`ml-4 px-4 py-2 font-medium focus:outline-none transition border-b-2 ${activeTab === 'view' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
            onClick={() => setActiveTab('view')}
          >
            View Products
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'add' && (
          <div className="w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{formError}</div>}
              {formSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{formSuccess}</div>}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter product title"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter brand"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter stock"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 disabled:opacity-60"
                >
                  {formLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 'view' && (
          <div className="w-full">
            <ProductTable
              key={tableKey}
              onEdit={product => setEditingProduct(product)}
            />
            {editingProduct && (
              <EditProductForm
                product={editingProduct}
                onSave={updatedProduct => {
                  setEditingProduct(null);
                  setTableKey(k => k + 1); // force table refresh
                }}
                onCancel={() => setEditingProduct(null)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard; 