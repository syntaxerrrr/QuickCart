import React, { useState, useRef, useEffect } from "react";
import { Order, OrderStatus } from "../types";
import { Package, Clock, CheckCircle2, Truck, Printer, X, Plus, Minus, Trash2, Ban, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const CustomDatePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(parseLocalDate(value));

  useEffect(() => {
    if (isOpen) {
      setViewDate(parseLocalDate(value));
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const yyyy = viewDate.getFullYear();
    const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-sm font-bold text-gray-900 dark:text-white transition-all cursor-pointer shadow-sm"
      >
        <Calendar size={16} className={value ? "text-green-600 dark:text-green-500" : "text-gray-400"} />
        {value ? parseLocalDate(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'All Dates'}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h4>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setViewDate(new Date())}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors cursor-pointer"
                title="Go to current month"
              >
                <Clock size={14} />
              </button>
              {(() => {
                const isNextMonthFuture = viewDate.getFullYear() > new Date().getFullYear() || (viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() >= new Date().getMonth());
                return (
                  <button
                    onClick={handleNextMonth}
                    disabled={isNextMonthFuture}
                    className={`p-1.5 rounded-lg transition-colors ${isNextMonthFuture
                        ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                      }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                );
              })()}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isSelected = value === `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = new Date().toDateString() === cellDate.toDateString();

              const todayTimestamp = new Date();
              todayTimestamp.setHours(0, 0, 0, 0);
              const cellTimestamp = new Date(cellDate);
              cellTimestamp.setHours(0, 0, 0, 0);
              const isFuture = cellTimestamp > todayTimestamp;

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && handleSelectDate(day)}
                  disabled={isFuture}
                  title={cellDate.toLocaleDateString()}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isFuture
                      ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'
                      : isSelected
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md scale-105 cursor-pointer'
                        : isToday
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:font-bold cursor-pointer'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer px-2 py-1"
            >
              Clear Filter
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                onChange(`${yyyy}-${mm}-${dd}`);
                setIsOpen(false);
              }}
              className="text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors cursor-pointer px-2 py-1"
            >
              Go to Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminDashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderItem: (orderId: string, itemId: string, quantity: number) => void;
  onRemoveOrderItem: (orderId: string, itemId: string) => void;
}

const statusConfig: Record<OrderStatus, { color: string; icon: any }> = {
  Pending: {
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  "On Process": {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Package,
  },
  "Ready to Pick Up": {
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Truck,
  },
  Completed: {
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  Cancelled: {
    color:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: Ban,
  },
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateStatus,
  onUpdateOrderItem,
  onRemoveOrderItem,
}) => {
  const statuses: OrderStatus[] = [
    "Pending",
    "On Process",
    "Ready to Pick Up",
    "Completed",
    "Cancelled",
  ];

  // Only the 4 flow statuses have a sequential order; Cancelled is outside the flow
  const flowStatuses: OrderStatus[] = ["Pending", "On Process", "Ready to Pick Up", "Completed"];
  const statusIndex = (s: OrderStatus) => flowStatuses.indexOf(s);

  const [confirm, setConfirm] = useState<{
    orderId: string;
    status: OrderStatus;
  } | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const [dateFilter, setDateFilter] = useState<string>(getTodayString());

  const filteredOrders = orders.filter(order => {
    if (!dateFilter) return true;
    const orderDate = new Date(order.createdAt);
    const yyyy = orderDate.getFullYear();
    const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
    const dd = String(orderDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` === dateFilter;
  });

  const handleConfirm = () => {
    if (confirm) {
      const order = orders.find(o => o.id === confirm.orderId);
      onUpdateStatus(confirm.orderId, confirm.status);
      if (confirm.status === 'Completed' && order) {
        setReceiptOrder({ ...order, status: 'Completed' });
      }
    }
    setConfirm(null);
  };

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;

    const style = document.createElement('style');
    style.id = '__receipt_print_style__';
    style.innerHTML = `
      @page { margin: 0; size: 80mm auto; }
      @media print {
        body > *:not(#__receipt_root__) { display: none !important; }
        #__receipt_root__ {
          display: block !important;
          position: fixed;
          inset: 0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          padding: 32px;
          max-width: 320px;
          margin: 0 auto;
          color: #000;
        }
      }
    `;

    const div = document.createElement('div');
    div.id = '__receipt_root__';
    div.style.display = 'none';
    div.innerHTML = content;

    document.head.appendChild(style);
    document.body.appendChild(div);

    window.print();

    document.head.removeChild(style);
    document.body.removeChild(div);
  };

  return (
    <div className="space-y-6">
      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-sm mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Order Receipt</h3>
              <button onClick={() => setReceiptOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div ref={receiptRef} className="font-mono text-sm text-gray-800">
                {/* Store Header */}
                <div className="text-center mb-4">
                  <p className="text-xl font-black tracking-widest">QUICKCART</p>
                  <p className="text-xs text-gray-500">Online Grocery</p>
                  <p className="text-xs text-gray-400 mt-1">--------------------------------</p>
                  <p className="text-xs font-black tracking-widest uppercase mt-2">Acknowledgement Receipt</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">This is not an official receipt.</p>
                  <p className="text-[10px] text-gray-400">For reference purposes only.</p>
                  <p className="text-xs text-gray-400 mt-1">--------------------------------</p>
                </div>

                {/* Order Info */}
                <div className="mb-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="font-bold">#{receiptOrder.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-bold capitalize">{receiptOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-bold">{new Date(receiptOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-bold">{new Date(receiptOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center my-3">--------------------------------</p>

                {/* Items */}
                <div className="mb-3 space-y-2">
                  {receiptOrder.items.map((item, i) => (
                    <div key={i}>
                      <p className="font-bold text-xs">{item.name}</p>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{item.quantity} x ₱{item.price.toFixed(2)}</span>
                        <span className="font-bold">₱{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 text-center my-3">--------------------------------</p>

                {/* Total */}
                <div className="flex justify-between font-black text-base mb-1">
                  <span>TOTAL</span>
                  <span>₱{receiptOrder.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Status</span>
                  <span className="font-bold text-green-600">COMPLETED</span>
                </div>

                <p className="text-xs text-gray-400 text-center my-3">--------------------------------</p>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 space-y-1">
                  <p>Thank you for shopping!</p>
                  <p>Visit us again at QuickCart</p>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Printer size={18} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
              Change Order Status
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to change the status to{" "}
              <span className="font-black text-gray-900 dark:text-white">
                "{confirm.status}"
              </span>
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors cursor-pointer"
              >
                Yes, Change It
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order Management
        </h2>
        <div className="flex items-center gap-3">
          <CustomDatePicker value={dateFilter} onChange={setDateFilter} />
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
            Total Orders: {filteredOrders.length}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p>No orders found for the selected date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const Config = statusConfig[order.status].icon;
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-bold text-gray-400 dark:text-gray-500">
                        #{order.id.slice(-6)}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                        {order.customerName}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig[order.status].color}`}
                      >
                        <Config size={12} />
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => {
                      const isCancelled = order.status === 'Cancelled';
                      const isCurrent = order.status === status;

                      if (status === 'Cancelled') {
                        // Cancel button is disabled once already cancelled or completed
                        const isDisabled = isCancelled || order.status === 'Completed';
                        return (
                          <button
                            key={status}
                            onClick={() => !isDisabled && setConfirm({ orderId: order.id, status })}
                            disabled={isDisabled}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${isDisabled
                              ? "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                              : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer"
                              }`}
                          >
                            <Ban size={11} />
                            {status}
                          </button>
                        );
                      }

                      // Flow buttons — all disabled when order is cancelled
                      const isPast = isCancelled || statusIndex(status) < statusIndex(order.status);
                      return (
                        <button
                          key={status}
                          onClick={() => !isPast && !isCurrent && setConfirm({ orderId: order.id, status })}
                          disabled={isPast || isCurrent}
                          title={!isCancelled && isPast ? "Cannot revert to a previous status" : undefined}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isCancelled
                            ? "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : isCurrent
                              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md cursor-default"
                              : isPast
                                ? "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through"
                                : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-50 dark:border-gray-700 pt-4">
                  <div className="space-y-2 mb-4">
                    {order.items.length === 0 ? (
                      <p className="text-xs text-red-400 italic text-center py-2">All items have been removed from this order.</p>
                    ) : order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm gap-2"
                      >
                        <span className="text-gray-600 dark:text-gray-400 flex-1 min-w-0 truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {order.status !== 'Completed' && order.status !== 'Cancelled' ? (
                            <>
                              <button
                                onClick={() => onUpdateOrderItem(order.id, item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                title="Decrease quantity"
                                className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="w-7 text-center font-bold text-gray-900 dark:text-white text-xs">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateOrderItem(order.id, item.id, item.quantity + 1)}
                                title="Increase quantity"
                                className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                              >
                                <Plus size={10} />
                              </button>
                              <button
                                onClick={() => onRemoveOrderItem(order.id, item.id)}
                                title="Remove item (out of stock)"
                                className="w-6 h-6 flex items-center justify-center rounded bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer ml-1"
                              >
                                <Trash2 size={10} />
                              </button>
                            </>
                          ) : (
                            <span className="font-bold text-gray-900 dark:text-white text-xs mr-1">{item.quantity}x</span>
                          )}
                          <span className="font-mono text-gray-400 dark:text-gray-500 w-20 text-right">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-700">
                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-xl font-mono font-bold text-green-600">
                      ₱{order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
