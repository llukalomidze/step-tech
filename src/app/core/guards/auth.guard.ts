import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Forces login for protected routes; preserves the intended URL via ?redirect=. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  if (auth.isAuthenticated()) return true;
  toast.info('Please sign in to continue.');
  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};
