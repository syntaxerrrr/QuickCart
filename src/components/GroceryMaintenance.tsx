import React, { useState } from 'react';
import { GroceryItem, Category } from '../types';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface GroceryMaintenanceProps {
  items: GroceryItem[];
  loading?: boolean;
  onAddItem: (item: Omit<GroceryItem, 'id'>) => void;
  onUpdateItem: (item: GroceryItem) => void;
  onDeleteItem: (id: string) => void;
}

const CATEGORIES: Category[] = ['Coffee', 'Milk', 'Detergent', 'Soap', 'Processed Cans', 'Softdrinks', 'Others'];

export const GroceryMaintenance: React.FC<GroceryMaintenanceProps> = ({
  items,
  loading = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<GroceryItem, 'id'>>({
    name: '',
    category: 'Coffee',
    price: 0,
  });
  const [nameError, setNameError] = useState('');

  const isDuplicate = (name: string) =>
    items.some(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase() && item.id !== editingId
    );

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    setNameError(isDuplicate(name) ? 'An item with this name already exists.' : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate(formData.name)) {
      setNameError('An item with this name already exists.');
      return;
    }
    if (editingId) {
      onUpdateItem({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      onAddItem(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', category: 'Coffee', price: 0 });
    setNameError('');
  };

  const startEdit = (item: GroceryItem) => {
    setEditingId(item.id);
    setFormData({ name: item.name, category: item.category, price: item.price });
    setIsAdding(false);
  };

  const cancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', category: 'Coffee', price: 0 });
    setNameError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Maintenance</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Add New Item
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-green-100 dark:border-green-900/50 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{editingId ? 'Edit Item' : 'Add New Grocery Item'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Item Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${nameError ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'}`}
                placeholder="e.g. Fresh Strawberries"
              />
              {nameError && <p className="text-xs text-red-500 font-medium">{nameError}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Price (₱)</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Check size={18} />
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                    No items found.
                  </td>
                </tr>
              ) : (
              [...items].sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">₱{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
