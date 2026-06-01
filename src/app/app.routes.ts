import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { cartNotEmptyGuard } from './core/guards/cart-not-empty.guard';
import { authGuard } from './core/guards/auth.guard';

/**
 * Lazy-loaded standalone components. The MainLayoutComponent wraps every page
 * so the header / footer / loading bar / toast container live in one place.
 */
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent), title: 'STEP TECH — Modern Electronics' },
      { path: 'shop', loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent), title: 'Shop · STEP TECH' },
      { path: 'shop/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then((m) => m.ProductDetailComponent), title: 'Product · STEP TECH' },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent), title: 'Cart · STEP TECH' },
      { path: 'cart/checkout', canActivate: [authGuard, cartNotEmptyGuard], loadComponent: () => import('./features/cart/checkout.component').then((m) => m.CheckoutComponent), title: 'Checkout · STEP TECH' },
      { path: 'order-confirmed/:id', loadComponent: () => import('./features/cart/order-confirmed.component').then((m) => m.OrderConfirmedComponent), title: 'Order placed · STEP TECH' },
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent), title: 'Sign in · STEP TECH' },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent), title: 'Create account · STEP TECH' },
      { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email.component').then((m) => m.VerifyEmailComponent), title: 'Verify email · STEP TECH' },
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent), title: 'Profile · STEP TECH' },
      { path: 'about', loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent), title: 'About · STEP TECH' },
      { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent), title: 'Contact · STEP TECH' },
      { path: '404', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent), title: 'Not found · STEP TECH' },
      { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent), title: 'Not found · STEP TECH' }
    ]
  }
];
