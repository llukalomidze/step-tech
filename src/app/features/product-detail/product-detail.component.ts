import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { combineLatest, filter, map, of, switchMap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductDetailed, Product } from '../../core/models/product.model';
import { Review } from '../../core/models/review.model';
import { CurrencyGelPipe } from '../../shared/pipes/currency-gel.pipe';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';
import { RatingStarsComponent } from '../../shared/components/rating-stars.component';
import { QuantityInputComponent } from '../../shared/components/quantity-input.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { LoaderComponent } from '../../shared/components/loader.component';
import { RevealDirective, RevealStaggerDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, CurrencyGelPipe, LazyImageDirective,
    RatingStarsComponent, QuantityInputComponent, ButtonComponent,
    ProductCardComponent, LoaderComponent, RevealDirective, RevealStaggerDirective
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly products = inject(ProductService);
  private readonly reviews = inject(ReviewService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<ProductDetailed | null>(null);
  readonly related = signal<Product[]>([]);
  readonly reviewList = signal<Review[]>([]);
  readonly activeImage = signal<string | null>(null);
  readonly quantity = signal<number>(1);
  readonly loading = signal<boolean>(true);

  readonly gallery = computed<string[]>(() => {
    const p = this.product(); if (!p) return [];
    const set = new Set<string>();
    if (p.imageUrl) set.add(p.imageUrl);
    (p.imageUrls ?? []).forEach((u) => { if (u) set.add(u); });
    return [...set];
  });

  readonly specsList = computed<{ k: string; v: string }[]>(() => {
    const obj = this.product()?.specifications ?? {};
    return Object.entries(obj).map(([k, v]) => ({ k, v }));
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((p) => Number(p.get('id'))),
        filter((id) => Number.isFinite(id) && id > 0),
        switchMap((id) => {
          this.loading.set(true);
          this.product.set(null);
          this.related.set([]);
          this.reviewList.set([]);
          return this.products.detail(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (p) => {
          this.product.set(p);
          this.activeImage.set(p.imageUrl ?? p.imageUrls?.[0] ?? null);
          this.quantity.set(1);
          this.loading.set(false);
          // Side-loads run in parallel via combineLatest — both populate before
          // the related-products and reviews sections reveal together.
          const related$ = p.category?.id
            ? this.products.related(p.category.id, p.id, 4)
            : of<Product[]>([]);
          combineLatest([related$, this.reviews.forProduct(p.id, 1, 6)])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(([related, reviewsPage]) => {
              this.related.set(related);
              this.reviewList.set(reviewsPage.items);
            });
        },
        error: () => this.loading.set(false)
      });
  }

  setImage(url: string): void { this.activeImage.set(url); }
  setQuantity(n: number): void { this.quantity.set(n); }

  addToCart(): void {
    const p = this.product(); if (!p) return;
    this.cart.add(p, this.quantity());
    this.toast.success(`Added ${this.quantity()} × ${p.name} to cart`);
  }

  onRelatedAdd(p: Product): void {
    this.cart.add(p, 1);
    this.toast.success(`${p.name} added to cart`);
  }
}
