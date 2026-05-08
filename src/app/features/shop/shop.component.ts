import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Paged } from '../../core/models/paged.model';
import { DEFAULT_FILTERS, ProductFilters, SortField } from '../../core/models/filters.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card.component';
import { RevealStaggerDirective } from '../../shared/directives/reveal.directive';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

interface SortOption { labelKey: string; sortBy: SortField; sortDescending: boolean; key: string; }

const SORT_OPTIONS: readonly SortOption[] = [
  { labelKey: 'shop.sort.newest',     sortBy: 'createdAt', sortDescending: true,  key: 'newest' },
  { labelKey: 'shop.sort.popularity', sortBy: 'rating',    sortDescending: true,  key: 'popularity' },
  { labelKey: 'shop.sort.priceAsc',   sortBy: 'price',     sortDescending: false, key: 'price-asc' },
  { labelKey: 'shop.sort.priceDesc',  sortBy: 'price',     sortDescending: true,  key: 'price-desc' },
  { labelKey: 'shop.sort.rating',     sortBy: 'rating',    sortDescending: true,  key: 'rating' }
] as const;

@Component({
  selector: 'app-shop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, ProductCardComponent, EmptyStateComponent, ButtonComponent, SkeletonCardComponent, RevealStaggerDirective, TranslatePipe],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  private readonly products = inject(ProductService);
  private readonly categories = inject(CategoryService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly translations = inject(TranslationService);

  readonly sortOptions = SORT_OPTIONS;

  readonly filters = signal<ProductFilters>({ ...DEFAULT_FILTERS });
  readonly result = signal<Paged<Product> | null>(null);
  readonly loading = signal(true);
  readonly categoryList = signal<Category[]>([]);

  readonly sortKey = computed(() => {
    const f = this.filters();
    return SORT_OPTIONS.find((o) => o.sortBy === f.sortBy && o.sortDescending === f.sortDescending)?.key ?? 'newest';
  });

  /** FormControls back the text inputs so we get debounced commits without
   *  re-rendering the input on every keystroke (which was breaking focus/cursor). */
  readonly searchCtrl = new FormControl<string>('', { nonNullable: true });
  readonly minPriceCtrl = new FormControl<number | null>(null);
  readonly maxPriceCtrl = new FormControl<number | null>(null);

  constructor() {
    // toObservable() requires an injection context — the constructor provides one.
    // Watch filters → call the API (debounceTime tames the chip-mash case).
    toObservable(this.filters)
      .pipe(
        debounceTime(50),
        tap(() => this.loading.set(true)),
        switchMap((f) => this.products.filter(f)),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => { this.result.set(res); this.loading.set(false); },
        error: () => this.loading.set(false)
      });

    // Debounced search → patch filters.
    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.patch({ search: q ?? '', page: 1 }));

    // Debounced price range → patch filters when both have settled.
    combineLatest([
      this.minPriceCtrl.valueChanges.pipe(startWith(this.minPriceCtrl.value)),
      this.maxPriceCtrl.valueChanges.pipe(startWith(this.maxPriceCtrl.value))
    ])
      .pipe(debounceTime(450), takeUntilDestroyed())
      .subscribe(([min, max]) => {
        const current = this.filters();
        if (current.minPrice === min && current.maxPrice === max) return;
        this.patch({ minPrice: min, maxPrice: max, page: 1 });
      });
  }

  ngOnInit(): void {
    this.categories.list().pipe(takeUntilDestroyed()).subscribe((cats) => this.categoryList.set(cats));

    // Hydrate from query params (shareable URLs).
    const params = this.route.snapshot.queryParamMap;
    const hydrated: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: params.get('q') ?? '',
      categoryId: this.numOrNull(params.get('category')),
      minRating: this.numOrNull(params.get('minRating')),
      minPrice: this.numOrNull(params.get('minPrice')),
      maxPrice: this.numOrNull(params.get('maxPrice')),
      ...this.sortFromKey(params.get('sort'))
    };
    this.filters.set(hydrated);
    this.searchCtrl.setValue(hydrated.search, { emitEvent: false });
    this.minPriceCtrl.setValue(hydrated.minPrice, { emitEvent: false });
    this.maxPriceCtrl.setValue(hydrated.maxPrice, { emitEvent: false });
  }

  patch(part: Partial<ProductFilters>): void {
    this.filters.update((f) => ({ ...f, ...part }));
    this.syncQueryParams();
  }

  reset(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.searchCtrl.setValue('', { emitEvent: false });
    this.minPriceCtrl.setValue(null, { emitEvent: false });
    this.maxPriceCtrl.setValue(null, { emitEvent: false });
    this.syncQueryParams();
  }

  applySort(key: string): void { this.patch(this.sortFromKey(key)); }

  onAddToCart(product: Product): void {
    this.cart.add(product, 1);
    this.toast.success(`${product.name} added to cart`);
  }

  changePage(delta: number): void {
    const r = this.result(); if (!r) return;
    const next = Math.max(1, Math.min(r.totalPages, this.filters().page + delta));
    this.patch({ page: next });
  }

  private sortFromKey(key: string | null): Partial<ProductFilters> {
    const opt = SORT_OPTIONS.find((o) => o.key === key);
    if (!opt) return {};
    return { sortBy: opt.sortBy, sortDescending: opt.sortDescending };
  }

  private numOrNull(s: string | null): number | null {
    if (s === null || s === '') return null;
    const n = Number(s); return Number.isFinite(n) ? n : null;
  }

  private syncQueryParams(): void {
    const f = this.filters();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: f.search || null,
        category: f.categoryId,
        minRating: f.minRating,
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
        sort: this.sortKey(),
        page: f.page > 1 ? f.page : null
      },
      queryParamsHandling: 'merge'
    });
  }
}
