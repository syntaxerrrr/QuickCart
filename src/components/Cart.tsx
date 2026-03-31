import React from 'react';
import { CartItem } from '../types';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <ShoppingBag size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm">Add some delicious groceries to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-bottom border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">₱{item.price.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-mono text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 dark:text-gray-300 font-medium">Total Amount</span>
          <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">₱{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100 dark:shadow-none cursor-pointer"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};
