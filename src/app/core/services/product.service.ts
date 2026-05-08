import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Paged } from '../models/paged.model';
import { Product, ProductDetailed } from '../models/product.model';
import { ProductFilters } from '../models/filters.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  list(page = 1, take = 12): Observable<Paged<Product>> {
    return this.api.get<Paged<Product>>('/api/products', { Page: page, Take: take });
  }

  search(query: string, page = 1, take = 12): Observable<Paged<Product>> {
    return this.api.get<Paged<Product>>('/api/products/search', { query, Page: page, Take: take });
  }

  /** Full filter endpoint backing the Shop page. */
  filter(f: ProductFilters): Observable<Paged<Product>> {
    return this.api.get<Paged<Product>>('/api/products/filter', {
      Search: f.search || null,
      Brand: f.brand,
      InStock: f.inStock,
      CategoryId: f.categoryId,
      MinRating: f.minRating,
      MinPrice: f.minPrice,
      MaxPrice: f.maxPrice,
      SortBy: f.sortBy,
      SortDescending: f.sortDescending,
      Page: f.page,
      Take: f.take
    });
  }

  detail(id: number): Observable<ProductDetailed> {
    return this.api.get<ProductDetailed>(`/api/products/${id}`);
  }

  /** Best-sellers section on the home page — top-rated, descending. */
  featured(take = 8): Observable<Product[]> {
    return this.api
      .get<Paged<Product>>('/api/products/filter', {
        SortBy: 'rating',
        SortDescending: true,
        Page: 1,
        Take: take
      })
      .pipe(map((p) => p.items));
  }

  related(categoryId: number, excludeId: number, take = 4): Observable<Product[]> {
    return this.api
      .get<Paged<Product>>('/api/products/filter', { CategoryId: categoryId, Take: take + 1, Page: 1 })
      .pipe(map((p) => p.items.filter((it) => it.id !== excludeId).slice(0, take)));
  }
}
