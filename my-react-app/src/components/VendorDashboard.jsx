import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ProductTable from './ProductTable';
import EditProductForm from './EditProductForm';
import { FiTag, FiBox, FiLayers, FiHash, FiFileText, FiImage, FiPackage } from 'react-icons/fi';

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
  const [formTouched, setFormTouched] = useState({});
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [editingProduct, setEditingProduct] = useState(null);
  const [tableKey, setTableKey] = useState(0); // for forcing table refresh
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (editingProduct) {
      setActiveTab('add');
      setForm(editingProduct);
      setEditingId(editingProduct.id);
      setTimeout(() => {
        const formEl = document.getElementById('add-product-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormTouched({ ...formTouched, [e.target.name]: true });
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

  const getFieldError = (name) => {
    if (!formTouched[name]) return '';
    switch (name) {
      case 'title':
        return !form.title.trim() ? 'Product title is required.' : '';
      case 'category':
        return !form.category.trim() ? 'Category is required.' : '';
      case 'brand':
        return !form.brand.trim() ? 'Brand is required.' : '';
      case 'price':
        return !form.price || isNaN(form.price) || Number(form.price) <= 0 ? 'Valid price is required.' : '';
      case 'stock':
        return !form.stock || isNaN(form.stock) || Number(form.stock) < 0 ? 'Valid stock is required.' : '';
      case 'description':
        return !form.description.trim() ? 'Description is required.' : '';
      case 'imageUrl':
        return !form.imageUrl.trim() ? 'Image URL is required.' : '';
      default:
        return '';
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditingId(null);
    setForm(initialForm);
    setFormTouched({});
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormTouched({
      title: true,
      category: true,
      brand: true,
      price: true,
      stock: true,
      description: true,
      imageUrl: true,
    });
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    setFormLoading(true);
    try {
      if (editingId) {
        // Update existing product
        const { id, ...rest } = form;
        await import('firebase/firestore').then(({ doc, updateDoc }) =>
          updateDoc(doc(db, 'products', editingId), {
            ...rest,
            price: Number(form.price),
            stock: Number(form.stock),
          })
        );
        setFormSuccess('Product updated successfully!');
        setEditingProduct(null);
        setEditingId(null);
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          createdAt: serverTimestamp(),
          vendorId: auth.currentUser.uid,
        });
        setFormSuccess('Product saved successfully!');
      }
      setForm(initialForm);
      setFormTouched({});
      setTimeout(() => setFormSuccess(''), 2000);
      setTableKey(k => k + 1); // refresh table
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
    <div className="min-h-screen bg-gray-100 font-sans">
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
          <div className="w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form id="add-product-form" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} autoComplete="off">
              {/* Title */}
              <div className="col-span-1">
                <label className="block text-gray-700 font-semibold mb-2">Product Title</label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border ${getFieldError('title') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                    placeholder="Enter product title"
                  />
                </div>
                {getFieldError('title') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('title')}</span>}
              </div>
              {/* Category */}
              <div className="col-span-1">
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <div className="relative">
                  <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border ${getFieldError('category') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                    placeholder="Enter category"
                  />
                </div>
                {getFieldError('category') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('category')}</span>}
              </div>
              {/* Brand */}
              <div className="col-span-1">
                <label className="block text-gray-700 font-semibold mb-2">Brand</label>
                <div className="relative">
                  <FiBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border ${getFieldError('brand') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                    placeholder="Enter brand"
                  />
                </div>
                {getFieldError('brand') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('brand')}</span>}
              </div>
              {/* Price & Stock */}
              <div className="col-span-1 flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">Price (₹)</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border ${getFieldError('price') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {getFieldError('price') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('price')}</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">Stock</label>
                  <div className="relative">
                    <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border ${getFieldError('stock') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                      placeholder="Enter stock"
                      min="0"
                      step="1"
                    />
                  </div>
                  {getFieldError('stock') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('stock')}</span>}
                </div>
              </div>
              {/* Description */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-4 text-gray-400" />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border ${getFieldError('description') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
                {getFieldError('description') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('description')}</span>}
              </div>
              {/* Image URL */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Image URL</label>
                <div className="relative">
                  <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border ${getFieldError('imageUrl') ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition`}
                    placeholder="Enter image URL"
                  />
                </div>
                {getFieldError('imageUrl') && <span className="text-xs text-red-500 mt-1 block">{getFieldError('imageUrl')}</span>}
              </div>
              {/* Save Button */}
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 items-center mt-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`w-full md:w-auto py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-lg shadow-lg transition-all duration-150 flex items-center justify-center gap-2 ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {formLoading ? (
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : (
                    editingId ? 'Update Product' : 'Save Product'
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full md:w-auto py-3 px-8 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-lg shadow-lg transition-all duration-150"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              {formSuccess && <div className="col-span-1 md:col-span-2 mt-3 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center animate-fadeIn">{formSuccess}</div>}
              {formError && <div className="col-span-1 md:col-span-2 mt-3 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center animate-fadeIn">{formError}</div>}
            </form>
          </div>
        )}
        {activeTab === 'view' && (
          <div className="w-full">
            <ProductTable
              key={tableKey}
              onEdit={product => setEditingProduct(product)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard; 