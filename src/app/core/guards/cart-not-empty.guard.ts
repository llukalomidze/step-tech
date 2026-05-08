import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';

/** Blocks /cart/checkout if the cart is empty. */
export const cartNotEmptyGuard: CanActivateFn = () => {
  const cart = inject(CartService);
  const router = inject(Router);
  const toast = inject(ToastService);
  if (cart.isEmpty()) {
    toast.info('Your cart is empty.');
    return router.createUrlTree(['/shop']);
  }
  return true;
};
