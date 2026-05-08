import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LocalCartItem } from '../../core/models/cart.model';
import { CurrencyGelPipe } from '../../shared/pipes/currency-gel.pipe';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';
import { QuantityInputComponent } from '../../shared/components/quantity-input.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, CurrencyGelPipe, LazyImageDirective,
    QuantityInputComponent, ButtonComponent, EmptyStateComponent, TranslatePipe
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  trackById(_i: number, item: LocalCartItem): number { return item.productId; }

  setQuantity(productId: number, q: number): void {
    this.cart.setQuantity(productId, q);
  }

  remove(item: LocalCartItem): void {
    this.cart.remove(item.productId);
    this.toast.info(`${item.name} removed from cart`);
  }

  goCheckout(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in to place your order.');
      void this.router.navigate(['/login'], { queryParams: { redirect: '/cart/checkout' } });
      return;
    }
    void this.router.navigate(['/cart/checkout']);
  }
}
