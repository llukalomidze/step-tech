import { Product } from './product.model';

export interface CartItem {
  id: number;
  quantity: number;
  price: number;
  totalPrice: number;
  product: Product;
}

/** Local cart entry for guest users — stored in localStorage. */
export interface LocalCartItem {
  productId: number;
  quantity: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface EditCartItemRequest {
  itemId: number;
  quantity: number;
}
