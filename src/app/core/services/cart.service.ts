import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { LocalCartItem, AddToCartRequest, EditCartItemRequest } from '../models/cart.model';
import { Product } from '../models/product.model';

/**
 * Hybrid cart:
 *  - Source of truth = signal<LocalCartItem[]>; mirrored to localStorage via effect().
 *  - On checkout (when authenticated) the local items are pushed to the server cart
 *    via POST /api/cart/add-to-cart, then POST /api/users/checkout places the order.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly storageKey = environment.storageKeys.cart;

  private readonly _items = signal<LocalCartItem[]>(this.read());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.price * i.quantity, 0));
  readonly shipping = computed(() => (this.subtotal() > 0 && this.subtotal() < 200 ? 10 : 0));
  readonly total = computed(() => this.subtotal() + this.shipping());
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this._items()));
      } catch { /* ignore */ }
    });
  }

  add(product: Product, quantity = 1): void {
    const existing = this._items().find((i) => i.productId === product.id);
    if (existing) {
      this.setQuantity(product.id, Math.min(existing.quantity + quantity, product.stock || 999));
      return;
    }
    const entry: LocalCartItem = {
      productId: product.id,
      quantity: Math.min(quantity, product.stock || 999),
      name: product.name ?? 'Unnamed product',
      brand: product.brand ?? '',
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock
    };
    this._items.update((list) => [...list, entry]);
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) { this.remove(productId); return; }
    this._items.update((list) =>
      list.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock || 999) } : i))
    );
  }

  remove(productId: number): void {
    this._items.update((list) => list.filter((i) => i.productId !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  /**
   * Sync each local item to the server cart, then call checkout.
   * Requires authentication — guard ensures it before this is called.
   */
  syncAndCheckout(): Observable<unknown> {
    const items = this._items();
    if (items.length === 0) return of(null);

    const requests: Observable<unknown>[] = items.map((it) =>
      this.api.post<unknown, AddToCartRequest>('/api/cart/add-to-cart', {
        productId: it.productId,
        quantity: it.quantity
      })
    );

    // Sequential push, then checkout, to keep server state consistent.
    return requests.reduce<Observable<unknown>>(
      (acc, req) => acc.pipe(switchMap(() => req)),
      of(null)
    ).pipe(switchMap(() => this.api.post<unknown>('/api/users/checkout')));
  }

  /** PUT /api/cart/edit-quantity — used when the cart is server-side. */
  editServerQuantity(req: EditCartItemRequest): Observable<unknown> {
    return this.api.put<unknown, EditCartItemRequest>('/api/cart/edit-quantity', req);
  }

  /** DELETE /api/cart/remove-from-cart/{productId}. */
  removeServerItem(productId: number): Observable<unknown> {
    return this.api.delete<unknown>(`/api/cart/remove-from-cart/${productId}`);
  }

  private read(): LocalCartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as LocalCartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
