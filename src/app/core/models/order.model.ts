import { LocalCartItem } from './cart.model';

export interface OrderContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export type OrderPaymentMethod = 'card' | 'cod';

export interface SavedOrder {
  id: string;
  placedAt: string;
  items: LocalCartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  contact: OrderContact;
  paymentMethod: OrderPaymentMethod;
  isGuest: boolean;
}
