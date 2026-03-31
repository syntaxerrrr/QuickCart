import React, { useState } from "react";
import { Order } from "../types";
import { History, User as UserIcon, Package, Clock, ShieldCheck, Banknote, Eye } from "lucide-react";
import { CustomDatePicker, getTodayString } from "./CustomDatePicker";

interface AdminLogsProps {
    orders: Order[];
}

export const AdminLogs: React.FC<AdminLogsProps> = ({ orders }) => {
    const [dateFilter, setDateFilter] = useState<string>(getTodayString());

    const filteredOrders = orders.filter(order => {
        if (!dateFilter) return true;
        const orderDate = new Date(order.createdAt);
        const yyyy = orderDate.getFullYear();
        const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
        const dd = String(orderDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === dateFilter;
    });

    // Sort orders by most recent
    const sortedOrders = [...filteredOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalEarned = filteredOrders
        .filter(o => o.status === 'Completed')
        .reduce((sum, o) => sum + o.totalPrice, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <History className="text-gray-400" />
                    Order Logs
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800/50">
                        <Banknote className="text-green-500" size={18} />
                        <span className="text-sm font-black text-green-700 dark:text-green-400">
                            Total Earned: ₱{totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <CustomDatePicker value={dateFilter} onChange={setDateFilter} />
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                        Total Orders: {filteredOrders.length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Admin Catered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {sortedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No logs found for the selected date.
                                    </td>
                                </tr>
                            ) : (
                                sortedOrders.map((order) => {
                                    const dateObj = new Date(order.createdAt);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span>{dateObj.toLocaleDateString()}</span>
                                                    <span className="text-gray-400">|</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{dateObj.toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white capitalize">
                                                    <UserIcon size={14} className="text-gray-400" />
                                                    {order.customerName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative group/price inline-flex items-center gap-1.5 cursor-pointer">
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white border-b border-dashed border-gray-300 dark:border-gray-600 pb-0.5">
                                                        ₱{order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <Eye size={13} className="text-gray-400 group-hover/price:text-green-500 transition-colors" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-gray-300/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 p-3 opacity-0 invisible group-hover/price:opacity-100 group-hover/price:visible transition-all duration-200 z-50 pointer-events-none">
                                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ordered Items</p>
                                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                                            {order.items.length === 0 ? (
                                                                <p className="text-[11px] text-gray-400 italic">No items</p>
                                                            ) : order.items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                                                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate mr-2">{item.quantity}x {item.name}</span>
                                                                    <span className="font-mono font-bold text-gray-900 dark:text-white shrink-0">₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-[11px] font-black">
                                                            <span className="text-gray-500 dark:text-gray-400">TOTAL</span>
                                                            <span className="text-green-600 dark:text-green-400">₱{order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white dark:border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${order.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' :
                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                                                        order.status === 'Ready to Pick Up' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' :
                                                            order.status === 'On Process' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                                                                'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30'
                                                    }`}>
                                                    <Package size={12} />
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.processedBy ? (
                                                    <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                                                        <ShieldCheck size={14} />
                                                        {order.processedBy}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-[11px] font-bold">Waiting for Admin</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
