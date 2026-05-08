import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { EditProfileRequest } from '../models/user.model';
import { SavedOrder } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);
  private readonly key = environment.storageKeys.orders;

  /** POST /api/users/checkout — converts the server cart into an order. */
  placeOrder(): Observable<unknown> {
    return this.api.post<unknown>('/api/users/checkout');
  }

  /** PUT /api/users — saves shipping fields on the user profile before checkout. */
  saveShippingProfile(req: EditProfileRequest): Observable<unknown> {
    return this.api.put<unknown, EditProfileRequest>('/api/users', req);
  }

  /** Stores a placed order locally so we can render it on a confirmation page. */
  persistLocal(order: SavedOrder): void {
    const all = this.allLocal();
    all.unshift(order);
    try { localStorage.setItem(this.key, JSON.stringify(all.slice(0, 20))); }
    catch { /* storage unavailable */ }
  }

  findLocal(id: string): SavedOrder | null {
    return this.allLocal().find((o) => o.id === id) ?? null;
  }

  allLocal(): SavedOrder[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as SavedOrder[];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
}
