import React, { useState, useEffect, useRef } from 'react';
import { GroceryItem, CartItem, Order, OrderStatus, Category, User, NotificationRecord, isAdminRole } from './types';
import logo from './image/logo.png';
import { supabase } from './lib/supabase';
import { GroceryList } from './components/GroceryList';
import { Cart } from './components/Cart';
import { AdminDashboard } from './components/AdminDashboard';
import { GroceryMaintenance } from './components/GroceryMaintenance';
import { CustomerManagement } from './components/CustomerManagement';
import { CustomerOrders } from './components/CustomerOrders';
import { AdminLogs } from './components/AdminLogs';
import { Login } from './components/Login';
import { ShoppingCart, LayoutDashboard, Store, CheckCircle2, PackageSearch, ClipboardList, Lock, LogOut, History, Bell, Filter, User as UserIcon, Users, Moon, Sun, AlertTriangle, Search, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const savedUser = localStorage.getItem('currentUser');
  const [currentUser, setCurrentUser] = useState<User | null>(savedUser ? JSON.parse(savedUser) : null);
  const [view, setView] = useState<'customer' | 'admin'>(savedUser && isAdminRole(JSON.parse(savedUser).role) ? 'admin' : 'customer');
  const [customerSubView, setCustomerSubView] = useState<'shop' | 'orders'>('shop');
  const [adminSubView, setAdminSubView] = useState<'orders' | 'maintenance' | 'customers' | 'logs'>('orders');
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState<{ show: boolean; status: string }>({ show: false, status: '' });
  const [adminNotification, setAdminNotification] = useState<{ show: boolean; orderId: string }>({ show: false, orderId: '' });
  const [outOfStockNotification, setOutOfStockNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [notifHistory, setNotifHistory] = useState<NotificationRecord[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const prevOrdersRef = useRef<Order[]>([]);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const isLoadingNotifs = useRef(false);

  useEffect(() => {
    supabase
      .from('grocery_items')
      .select('id, name, category, price, image')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setGroceryItems(data as GroceryItem[]);
        setItemsLoading(false);
      });
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, user_id, customer_name, total_price, status, created_at, processed_by,
        order_items ( id, grocery_item_id, item_name, item_category, item_price, quantity )
      `)
      .order('created_at', { ascending: false });
    if (!error && data) {
      const mapped: Order[] = data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        customerName: row.customer_name,
        totalPrice: parseFloat(row.total_price),
        status: row.status as OrderStatus,
        createdAt: row.created_at,
        processedBy: row.processed_by,
        items: (row.order_items ?? []).map((oi: any) => ({
          id: oi.grocery_item_id ?? oi.id,
          name: oi.item_name,
          category: oi.item_category,
          price: parseFloat(oi.item_price),
          quantity: oi.quantity,
        })),
      }));
      setOrders(mapped);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load notification history from localStorage when user changes
  useEffect(() => {
    if (!currentUser) { setNotifHistory([]); return; }
    isLoadingNotifs.current = true;
    const stored = localStorage.getItem(`notifs_${currentUser.id}`);
    setNotifHistory(stored ? JSON.parse(stored) : []);
  }, [currentUser?.id]);

  // Save notification history whenever it changes (skip the initial load write)
  useEffect(() => {
    if (!currentUser) return;
    if (isLoadingNotifs.current) { isLoadingNotifs.current = false; return; }
    localStorage.setItem(`notifs_${currentUser.id}`, JSON.stringify(notifHistory));
  }, [notifHistory]);

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addNotif = (notif: Omit<NotificationRecord, 'id' | 'timestamp' | 'read'>) => {
    setNotifHistory(prev => [{
      ...notif,
      id: (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)),
      timestamp: new Date().toISOString(),
      read: false,
    }, ...prev].slice(0, 50));
  };

  // Notification effects — runs whenever orders are refreshed
  useEffect(() => {
    if (prevOrdersRef.current.length === 0) {
      prevOrdersRef.current = orders;
      return;
    }

    const prevIds = new Set(prevOrdersRef.current.map(o => o.id));

    if (currentUser && isAdminRole(currentUser.role)) {
      // Detect brand-new pending orders from any user
      const newPending = orders.filter(o => !prevIds.has(o.id) && o.status === 'Pending');
      if (newPending.length > 0) {
        const count = newPending.length;
        setAdminNotification({
          show: true,
          orderId: count === 1 ? newPending[0].id : `${count} new orders`,
        });
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play blocked:', e));
        setTimeout(() => setAdminNotification({ show: false, orderId: '' }), 8000);
        newPending.forEach(o => addNotif({
          type: 'new_order',
          message: 'New Order Received!',
          detail: `Order #${o.id.slice(-6).toUpperCase()} from ${o.customerName} — ₱${o.totalPrice.toFixed(2)}`,
        }));
      }
    }

    if (currentUser && !isAdminRole(currentUser.role)) {
      // Detect status changes on the current user's orders
      const changedOrders: Order[] = [];
      orders.filter(o => o.userId === currentUser.id).forEach(order => {
        const prev = prevOrdersRef.current.find(o => o.id === order.id);
        if (prev && prev.status !== order.status) changedOrders.push(order);
      });

      if (changedOrders.length > 0) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play blocked:', e));

        const cancelledOrders = changedOrders.filter(o => o.status === 'Cancelled');
        const otherChanged = changedOrders.filter(o => o.status !== 'Cancelled');

        if (cancelledOrders.length > 0) {
          const last = cancelledOrders[cancelledOrders.length - 1];
          setOutOfStockNotification({ show: true, message: `Order #${last.id.slice(-6).toUpperCase()} was cancelled due to out of stock.` });
          setTimeout(() => setOutOfStockNotification({ show: false, message: '' }), 6000);
          cancelledOrders.forEach(order => addNotif({
            type: 'out_of_stock',
            message: 'Order Cancelled',
            detail: `Order #${order.id.slice(-6).toUpperCase()} was cancelled due to out of stock.`,
          }));
        }

        if (otherChanged.length > 0) {
          setShowNotification({ show: true, status: otherChanged[otherChanged.length - 1].status });
          setTimeout(() => setShowNotification({ show: false, status: '' }), 5000);
          otherChanged.forEach(order => addNotif({
            type: 'status_change',
            message: 'Order Status Updated!',
            detail: `Order #${order.id.slice(-6).toUpperCase()} is now "${order.status}"`,
          }));
        }
      }

      // Detect items removed from the current user's orders (out of stock)
      orders.filter(o => o.userId === currentUser.id).forEach(order => {
        const prevOrder = prevOrdersRef.current.find(o => o.id === order.id);
        if (!prevOrder) return;
        prevOrder.items.forEach(prevItem => {
          const stillExists = order.items.find(i => i.id === prevItem.id);
          if (!stillExists) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => { });
            setOutOfStockNotification({ show: true, message: `"${prevItem.name}" is out of stock and was removed from your order.` });
            setTimeout(() => setOutOfStockNotification({ show: false, message: '' }), 7000);
            addNotif({
              type: 'out_of_stock',
              message: 'Item Out of Stock!',
              detail: `"${prevItem.name}" was removed from Order #${order.id.slice(-6).toUpperCase()}.`,
            });
          }
        });
      });
    }

    prevOrdersRef.current = orders;
  }, [orders, currentUser]);

  const handleLogin = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    if (isAdminRole(user.role)) {
      setView('admin');
      if (user.role === 'admin') setAdminSubView('orders');
      // Notify admin of pending orders on login
      const pendingOrders = orders.filter(o => o.status === 'Pending');
      if (pendingOrders.length > 0) {
        setAdminNotification({
          show: true,
          orderId: `${pendingOrders.length} active order${pendingOrders.length > 1 ? 's' : ''}`
        });
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play blocked by browser:', e));
        setTimeout(() => setAdminNotification({ show: false, orderId: '' }), 8000);
      }
    } else {
      setView('customer');
      // Notify customer of their OWN orders on login
      const myOrders = orders.filter(o => o.userId === user.id);
      if (myOrders.length > 0) {
        const activeOrders = myOrders.filter(o => o.status !== 'Completed');
        if (activeOrders.length > 0) {
          const statusText = activeOrders.length === 1
            ? `Your order is ${activeOrders[0].status}`
            : `You have ${activeOrders.length} active orders`;

          setShowNotification({ show: true, status: statusText });
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log('Audio play blocked by browser:', e));
          setTimeout(() => setShowNotification({ show: false, status: '' }), 8000);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setView('customer');
    setCart([]);
    setNotifOpen(false);
    setOutOfStockNotification({ show: false, message: '' });
    setShowNotification({ show: false, status: '' });
    setAdminNotification({ show: false, orderId: '' });
  };

  const addToCart = (item: GroceryItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !currentUser) return;

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: currentUser.id, customer_name: currentUser.name, total_price: totalPrice, status: 'Pending' })
      .select('id, created_at')
      .single();

    if (orderError || !orderData) return;

    await supabase.from('order_items').insert(
      cart.map((item) => ({
        order_id: orderData.id,
        grocery_item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_price: item.price,
        quantity: item.quantity,
      }))
    );

    const newOrder: Order = {
      id: orderData.id,
      userId: currentUser.id,
      customerName: currentUser.name,
      items: [...cart],
      totalPrice,
      status: 'Pending',
      createdAt: orderData.created_at,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setShowSuccess(true);
    setCustomerSubView('orders');

    setAdminNotification({ show: true, orderId: orderData.id });
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play blocked by browser:', e));
    addNotif({
      type: 'order_placed',
      message: 'Order Placed Successfully!',
      detail: `Order #${orderData.id.slice(-6).toUpperCase()} — ₱${totalPrice.toFixed(2)} is pending.`,
    });

    setTimeout(() => setShowSuccess(false), 3000);
    setTimeout(() => setAdminNotification({ show: false, orderId: '' }), 8000);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    let updates: any = { status };
    if (status === 'On Process' && currentUser && isAdminRole(currentUser.role)) {
      const order = orders.find(o => o.id === orderId);
      if (order && !order.processedBy) {
        updates.processed_by = currentUser.name;
      }
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) {
      console.error('Failed to update order status:', error.message);
      alert(`Error updating order status: ${error.message}\n(Did you run the 005_add_cancelled_status.sql migration?)`);
      return;
    }
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, status, ...(updates.processed_by ? { processedBy: updates.processed_by } : {}) };
        }
        return order;
      })
    );
  };

  const updateOrderItemQuantity = async (orderId: string, itemId: string, quantity: number) => {
    await supabase.from('order_items').update({ quantity }).eq('order_id', orderId).eq('grocery_item_id', itemId);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const updatedItems = order.items.map(item => item.id === itemId ? { ...item, quantity } : item);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await supabase.from('orders').update({ total_price: newTotal }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: updatedItems, totalPrice: newTotal } : o));
  };

  const removeOrderItem = async (orderId: string, itemId: string) => {
    await supabase.from('order_items').delete().eq('order_id', orderId).eq('grocery_item_id', itemId);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const updatedItems = order.items.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (updatedItems.length === 0) {
      const { error } = await supabase.from('orders').update({ total_price: 0, status: 'Cancelled' }).eq('id', orderId);
      if (error) {
        console.error('Failed to cancel order:', error.message);
        alert(`Error cancelling order: ${error.message}\n(Did you run the 005_add_cancelled_status.sql migration?)`);
        return;
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: [], totalPrice: 0, status: 'Cancelled' } : o));
    } else {
      const { error } = await supabase.from('orders').update({ total_price: newTotal }).eq('id', orderId);
      if (error) {
        console.error('Failed to update order total:', error.message);
        return;
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: updatedItems, totalPrice: newTotal } : o));
    }
  };

  const addGroceryItem = async (item: Omit<GroceryItem, 'id'>) => {
    const { data, error } = await supabase
      .from('grocery_items')
      .insert(item)
      .select('id, name, category, price, image')
      .single();
    if (!error && data) {
      setGroceryItems((prev) => [...prev, data as GroceryItem].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const updateGroceryItem = async (updatedItem: GroceryItem) => {
    const { id, ...fields } = updatedItem;
    const { error } = await supabase
      .from('grocery_items')
      .update(fields)
      .eq('id', id);
    if (!error) {
      setGroceryItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      setCart((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, name: updatedItem.name, price: updatedItem.price, category: updatedItem.category }
            : item
        )
      );
    }
  };

  const deleteGroceryItem = async (id: string) => {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', id);
    if (!error) {
      setGroceryItems((prev) => prev.filter((item) => item.id !== id));
      setCart((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const categories: (Category | 'All')[] = ['All', 'Coffee', 'Milk', 'Detergent', 'Soap', 'Processed Cans', 'Softdrinks', 'Others'];

  const filteredAndSortedItems = groceryItems
    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
    .filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const searchSuggestions = searchQuery
    ? groceryItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="QuickCart Logo"
              className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
            />
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white">QuickCart</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              {isAdminRole(currentUser.role) ? (
                <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-gray-900 dark:text-white">
                  <Lock size={16} className="text-gray-900 dark:text-white" />
                  Admin Portal
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-gray-900 dark:text-white">
                  <Store size={16} className="text-green-600" />
                  Customer Shop
                </div>
              )}
            </div>

            <div className="hidden sm:block h-8 w-px bg-gray-100" />

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white shrink-0">
                  <UserIcon size={16} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Logged in as</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white capitalize">{currentUser.name}</p>
                </div>
              </div>
              {/* Notification Bell */}
              <div className="relative" ref={notifPanelRef}>
                <button
                  onClick={() => {
                    if (!notifOpen) setNotifHistory(prev => prev.map(n => ({ ...n, read: true })));
                    setNotifOpen(o => !o);
                  }}
                  className="relative p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer"
                  title="Notification history"
                >
                  <Bell size={20} />
                  {notifHistory.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                      {notifHistory.filter(n => !n.read).length > 9 ? '9+' : notifHistory.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      key="notif-panel"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[200] overflow-hidden"
                    >
                      {/* Panel header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-black text-gray-900 dark:text-white">Notifications</span>
                        {notifHistory.length > 0 && (
                          <button
                            onClick={() => setNotifHistory([])}
                            className="text-[11px] text-gray-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Notification list */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                        {notifHistory.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-400">
                            <Bell size={28} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet.</p>
                          </div>
                        ) : notifHistory.map(notif => {
                          const relTime = (() => {
                            const diff = Date.now() - new Date(notif.timestamp).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 1) return 'Just now';
                            if (mins < 60) return `${mins}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            return `${Math.floor(hrs / 24)}d ago`;
                          })();
                          const iconEl = notif.type === 'new_order' ? <ClipboardList size={12} /> :
                            notif.type === 'status_change' ? <Bell size={12} /> :
                              notif.type === 'out_of_stock' ? <AlertTriangle size={12} /> :
                                <CheckCircle2 size={12} />;
                          const iconColor = notif.type === 'new_order' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                            notif.type === 'status_change' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                              notif.type === 'out_of_stock' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-500';
                          return (
                            <div key={notif.id} className={`px-4 py-3 flex gap-3 items-start ${notif.read ? '' : 'bg-blue-50/60 dark:bg-blue-900/10'}`}>
                              <div className={`shrink-0 rounded-full p-1.5 mt-0.5 ${iconColor}`}>{iconEl}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{notif.message}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{notif.detail}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{relTime}</p>
                              </div>
                              {!notif.read && <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsDark(d => !d)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer"
                title="Toggle dark mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isAdminRole(currentUser.role) && view === 'customer' ? (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <button
                  onClick={() => setCustomerSubView('shop')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${customerSubView === 'shop' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <Store size={18} />
                  Browse Shop
                </button>
                <button
                  onClick={() => setCustomerSubView('orders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${customerSubView === 'orders' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <History size={18} />
                  My Orders
                </button>
              </div>

              {customerSubView === 'shop' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6 min-w-0">
                    <header>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">QuickCart</h2>
                      <p className="text-gray-500 dark:text-gray-400">Handpicked quality items delivered to your doorstep.</p>
                    </header>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-20">
                      {/* Custom Category Dropdown */}
                      <div className="relative shrink-0" ref={categoryRef}>
                        <button
                          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                          className={`w-full md:w-56 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-2xl px-5 py-4 font-black text-sm outline-none shadow-sm cursor-pointer transition-colors flex justify-between items-center ${isCategoryOpen
                            ? 'border-green-500 ring-2 ring-green-500/20'
                            : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                            }`}
                        >
                          <span className="truncate">{selectedCategory} {selectedCategory === 'All' ? 'Categories' : ''}</span>
                          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-green-500' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isCategoryOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute w-full mt-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.3)] overflow-hidden z-50 flex flex-col max-h-72 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                            >
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    setSelectedCategory(cat);
                                    setIsCategoryOpen(false);
                                  }}
                                  className={`flex items-center px-5 py-3.5 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50 last:border-0 cursor-pointer ${selectedCategory === cat ? 'bg-green-50/50 dark:bg-green-900/10 text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-300 font-semibold'
                                    }`}
                                >
                                  {cat} {cat === 'All' ? 'Categories' : ''}
                                  {selectedCategory === cat && (
                                    <CheckCircle2 size={16} className="ml-auto text-green-500" />
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Search Bar */}
                      <div className="relative flex-1" ref={searchRef}>
                        <div className="relative">
                          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search groceries..."
                            value={searchQuery}
                            onFocus={() => setShowSuggestions(true)}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setShowSuggestions(true);
                            }}
                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl pl-12 pr-12 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:border-green-300 dark:hover:border-green-700 transition-colors placeholder:text-gray-400"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setShowSuggestions(false);
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                          {showSuggestions && searchQuery && searchSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute w-full mt-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.3)] overflow-hidden z-50 flex flex-col"
                            >
                              <div className="px-4 py-2 bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggestions</span>
                              </div>
                              {searchSuggestions.map((item, index) => (
                                <button
                                  key={`sug-${item.id}-${index}`}
                                  onClick={() => {
                                    setSearchQuery(item.name);
                                    setShowSuggestions(false);
                                  }}
                                  className="flex items-center justify-between px-5 py-3.5 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50 last:border-0 group/sug cursor-pointer"
                                >
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover/sug:text-green-600 dark:group-hover/sug:text-green-400 transition-colors">{item.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{item.category}</p>
                                  </div>
                                  <span className="text-green-600 dark:text-green-400 font-black">₱{item.price.toFixed(2)}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {itemsLoading ? (
                      <p className="text-gray-400 text-sm font-medium py-8 text-center">Loading items...</p>
                    ) : (
                      <GroceryList items={filteredAndSortedItems} onAddToCart={addToCart} />
                    )}
                  </div>

                  <div className="lg:col-span-4" id="cart-section">
                    <div className="sticky top-24">
                      <Cart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                        onCheckout={handleCheckout}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <CustomerOrders orders={orders.filter(o => o.userId === currentUser.id)} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
                <button
                  onClick={() => setAdminSubView('orders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${adminSubView === 'orders' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <ClipboardList size={18} />
                  Orders
                </button>
                <button
                  onClick={() => setAdminSubView('maintenance')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${adminSubView === 'maintenance' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <PackageSearch size={18} />
                  Inventory
                </button>
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => setAdminSubView('customers')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${adminSubView === 'customers' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Users size={18} />
                    Users
                  </button>
                )}
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => setAdminSubView('logs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${adminSubView === 'logs' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <History size={18} />
                    Logs
                  </button>
                )}
              </div>

              {adminSubView === 'orders' ? (
                <AdminDashboard currentUser={currentUser} orders={orders} onUpdateStatus={updateOrderStatus} onUpdateOrderItem={updateOrderItemQuantity} onRemoveOrderItem={removeOrderItem} />
              ) : adminSubView === 'maintenance' ? (
                <GroceryMaintenance
                  items={groceryItems}
                  loading={itemsLoading}
                  onAddItem={addGroceryItem}
                  onUpdateItem={updateGroceryItem}
                  onDeleteItem={deleteGroceryItem}
                />
              ) : adminSubView === 'customers' ? (
                <CustomerManagement />
              ) : (
                <AdminLogs orders={orders} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="success-notif"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800">
              <div className="bg-green-500 rounded-full p-1">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold">Order Placed Successfully!</p>
                <p className="text-xs text-gray-400">Check the Track My Orders tab to see your status.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Notification (Customer Only) */}
      <AnimatePresence>
        {showNotification.show && currentUser && !isAdminRole(currentUser.role) && (
          <motion.div
            key="status-notif"
            initial={{ opacity: 0, scale: 0.9, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 100 }}
            className="fixed top-20 right-4 sm:right-8 z-[100] w-fit max-w-[calc(100vw-2rem)]"
          >
            {(() => {
              const status = showNotification.status;
              let colorClass = 'text-green-600';
              let bgClass = 'bg-green-100';
              let borderClass = 'border-green-100';

              if (status.includes('Pending')) {
                colorClass = 'text-yellow-600';
                bgClass = 'bg-yellow-100';
                borderClass = 'border-yellow-100';
              } else if (status.includes('On Process')) {
                colorClass = 'text-blue-600';
                bgClass = 'bg-blue-100';
                borderClass = 'border-blue-100';
              } else if (status.includes('Ready to Pick Up')) {
                colorClass = 'text-purple-600';
                bgClass = 'bg-purple-100';
                borderClass = 'border-purple-100';
              }

              return (
                <div className={`bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${borderClass}`}>
                  <div className={`rounded-full p-2 ${bgClass} ${colorClass}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Order Update!</p>
                    <p className="text-xs text-gray-500">
                      <span className={`font-black uppercase ${colorClass}`}>
                        {showNotification.status}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Out of Stock Notification (Customer Only) */}
      <AnimatePresence>
        {outOfStockNotification.show && currentUser && !isAdminRole(currentUser.role) && (
          <motion.div
            key="outofstock-notif"
            initial={{ opacity: 0, scale: 0.9, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 100 }}
            className="fixed top-36 right-4 sm:right-8 z-[100] w-fit max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-white text-gray-900 px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-100 max-w-xs">
              <div className="rounded-full p-2 bg-red-100 text-red-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-red-600">Item Out of Stock!</p>
                <p className="text-xs text-gray-500">{outOfStockNotification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button for Mobile */}
      <AnimatePresence>
        {view === 'customer' && customerSubView === 'shop' && cart.length > 0 && (
          <motion.div
            key="floating-cart"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-40 lg:hidden w-fit"
          >
            <button
              onClick={() => {
                const cartElement = document.getElementById('cart-section');
                cartElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:bg-green-700 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-green-600">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <span>View Cart</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin New Order Notification (Admin Only) */}
      <AnimatePresence>
        {adminNotification.show && currentUser && isAdminRole(currentUser.role) && (
          <motion.div
            key="admin-notif"
            initial={{ opacity: 0, scale: 0.9, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -100 }}
            className="fixed top-20 left-4 sm:left-8 z-[100] w-fit max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-gray-900 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800">
              <div className="bg-blue-500 rounded-full p-2 text-white animate-pulse">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="font-bold text-blue-400">New Order Received!</p>
                <p className="text-xs text-gray-400">{adminNotification.orderId.includes('order') ? adminNotification.orderId : `Order #${adminNotification.orderId}`} is ready to prepare.</p>
              </div>
              <button
                onClick={() => {
                  setView('admin');
                  setAdminSubView('orders');
                  setAdminNotification({ show: false, orderId: '' });
                }}
                className="ml-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
              >
                View
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-700 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
          <p>© 2026 QuickCart Prototype. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
