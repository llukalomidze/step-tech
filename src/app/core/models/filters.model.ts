export type SortField = 'name' | 'price' | 'rating' | 'createdAt';

export interface ProductFilters {
  search: string;
  brand: string | null;
  inStock: boolean | null;
  categoryId: number | null;
  minRating: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: SortField;
  sortDescending: boolean;
  page: number;
  take: number;
}

export const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  brand: null,
  inStock: null,
  categoryId: null,
  minRating: null,
  minPrice: null,
  maxPrice: null,
  sortBy: 'createdAt',
  sortDescending: true,
  page: 1,
  take: 12
};
