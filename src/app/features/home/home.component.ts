import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card.component';
import { RevealDirective, RevealStaggerDirective } from '../../shared/directives/reveal.directive';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent, ButtonComponent, SkeletonCardComponent, RevealDirective, RevealStaggerDirective, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly featured = signal<Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.products.featured(8)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (featured) => { this.featured.set(featured); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  onAddToCart(product: Product): void {
    this.cart.add(product, 1);
    this.toast.success(`${product.name} added to bag`);
  }
}
