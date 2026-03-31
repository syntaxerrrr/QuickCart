import React, { useState } from 'react';
import { GroceryItem } from '../types';
import { Plus, Minus, ShoppingCart, Tag } from 'lucide-react';

interface GroceryListProps {
  items: GroceryItem[];
  onAddToCart: (item: GroceryItem, quantity: number) => void;
}

export const GroceryList: React.FC<GroceryListProps> = ({ items, onAddToCart }) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg font-bold">No groceries found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => {
        const currentQty = quantities[item.id] || 1;
        return (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-green-500/10 dark:bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-500 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/50 shadow-sm">
                      <Tag size={10} />
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
                    {item.name}
                  </h3>
                </div>
                <div className="shrink-0 flex flex-col items-end ml-4">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-green-400 dark:from-green-400 dark:to-green-300 drop-shadow-sm">
                    ₱{item.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/50 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-4 tracking-wider">Qty</span>
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleQtyChange(item.id, -1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-l-xl transition-all cursor-pointer active:bg-gray-50 dark:active:bg-gray-700"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <span className="w-10 text-center text-base font-black text-gray-900 dark:text-white tabular-nums selection:bg-transparent">{currentQty}</span>
                    <button
                      onClick={() => handleQtyChange(item.id, 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-r-xl transition-all cursor-pointer active:bg-gray-50 dark:active:bg-gray-700"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddToCart(item, currentQty);
                    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
                  }}
                  className="w-full relative overflow-hidden group/btn flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-600 dark:hover:bg-green-500 hover:text-white dark:hover:text-white hover:shadow-[0_8px_25px_rgb(34,197,94,0.3)] transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                  <ShoppingCart size={18} strokeWidth={2.5} className="group-hover/btn:-rotate-12 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span>Add To Cart</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
