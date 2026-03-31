import React from 'react';
import { Order, OrderStatus } from '../types';
import { Clock, Package, Truck, CheckCircle2, ShoppingBag, Ban } from 'lucide-react';

interface CustomerOrdersProps {
  orders: Order[];
}

const statusConfig: Record<OrderStatus, { color: string; icon: any; label: string; progress: number }> = {
  Pending: { color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending', progress: 25 },
  'On Process': { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400', icon: Package, label: 'On Process', progress: 50 },
  'Ready to Pick Up': { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck, label: 'Ready to Pick Up', progress: 75 },
  Completed: { color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Completed', progress: 100 },
  Cancelled: { color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400', icon: Ban, label: 'Cancelled', progress: 100 },
};

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-400">
        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">No orders yet</p>
        <p className="text-sm">Your order history will appear here once you place an order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h2>
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;
          return (
            <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-50 dark:bg-gray-700">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${order.status === 'Pending' ? 'bg-yellow-400' :
                      order.status === 'On Process' ? 'bg-blue-400' :
                        order.status === 'Ready to Pick Up' ? 'bg-purple-400' :
                          order.status === 'Cancelled' ? 'bg-red-400' : 'bg-green-500'
                    }`}
                  style={{ width: `${config.progress}%` }}
                />
              </div>

              <div className="flex justify-between items-start mb-6 mt-2">
                <div>
                  <p className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Order #{order.id.slice(-6)}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${config.color}`}>
                  <StatusIcon size={14} />
                  {config.label}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-50 dark:border-gray-700 pt-6 mb-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-gray-900 dark:text-white">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-mono text-gray-400 dark:text-gray-500">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-50 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Amount</span>
                <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">₱{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
