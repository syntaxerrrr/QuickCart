export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type Category = 'Coffee' | 'Milk' | 'Detergent' | 'Soap' | 'Processed Cans' | 'Softdrinks' | 'Others';

export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  image?: string;
}

export interface CartItem extends GroceryItem {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'On Process' | 'Ready to Pick Up' | 'Completed' | 'Cancelled';

export interface NotificationRecord {
  id: string;
  type: 'new_order' | 'status_change' | 'out_of_stock' | 'order_placed';
  message: string;
  detail: string;
  timestamp: string;
  read: boolean;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
