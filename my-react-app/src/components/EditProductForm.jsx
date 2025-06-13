import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function EditProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({ ...product });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
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
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'products', form.id), {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
    } catch (e) {
      setError('Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8" onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-6 text-gray-900">Edit Product</h3>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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
        <div className="md:col-span-2">
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
        <div className="md:col-span-2">
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
      </div>
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-md shadow-md transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 