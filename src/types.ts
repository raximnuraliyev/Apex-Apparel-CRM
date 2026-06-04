export type ClientStatus = 'Active' | 'Inactive' | 'Pending Approval';
export type ClientTier = 'Gold' | 'Platinum' | 'Bronze' | 'Silver';

export interface Client {
  _id: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  tier: ClientTier;
  totalOrders: number;
  totalSpend: number;
  status: ClientStatus;
  createdAt: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  companyName: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  shippingCarrier?: string;
  trackingNumber?: string;
  note?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export type ActiveTab = 'dashboard' | 'clients' | 'orders' | 'analytics';
