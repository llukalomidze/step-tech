# STEP TECH — Modern Angular 18 e-commerce

A production-quality Angular 18 standalone-component e-commerce demo, built against the public **STEP TECH** API at `https://shopapi.stepacademy.ge`. Final-project for IT academy STEP

## Stack

- **Angular 18+** (standalone components, signal-based `input()` / `output()`)
- **TypeScript** strict mode (no `any`)
- **Angular Signals** for state — no NgRx, no Akita
- **RxJS** for HTTP streams + reactive UI patterns (`debounceTime`, `distinctUntilChanged`, `switchMap`, `combineLatest`, `map`, `tap`, `filter`, `takeUntilDestroyed`)
- **Reactive Forms** with full validation (incl. custom validators)
- **Angular Router** with lazy-loaded feature routes
- **SCSS** with a CSS-variable design-token system
- Fully responsive — 1 / 2 / 3–4 column product grid for mobile / tablet / desktop

## Setup

```bash
# 1) install dependencies
npm install

# 2) start the dev server
npm start
# → http://localhost:4200
```

If the API requires an `X-API-KEY`, set it in `src/environments/environment.ts`:

```ts
apiKey: 'your-api-key-here'
```

## Build

```bash
npm run build           # production bundle in dist/step-tech-shop
```

## Project structure

```
src/app/
├── core/
│   ├── services/      ApiService · ProductService · CategoryService · CartService · AuthService · OrderService · ReviewService · ToastService · LoadingService
│   ├── models/        Product · Category · Cart · User · Review · Auth · Paged · Filters · Toast
│   ├── interceptors/  auth · loading · error
│   └── guards/        cart-not-empty · auth
├── shared/
│   ├── components/    ProductCard · Button · Loader · EmptyState · QuantityInput · Badge · RatingStars · ToastContainer · SkeletonCard
│   ├── pipes/         CurrencyGelPipe (₾)
│   ├── directives/    LazyImageDirective
│   └── validators/    luhn · nonEmptyTrimmed
├── features/
│   ├── home/          hero, best-sellers, categories, new arrivals, CTA
│   ├── shop/          search · filter (category/price/rating/in-stock) · sort · pagination
│   ├── product-detail/ /shop/:id — gallery, specs, reviews, related, add-to-cart
│   ├── cart/          line items, quantities, remove, summary
│   ├── cart/checkout/ reactive form (name/email/phone/address/payment), Luhn-validated
│   ├── auth/          login · register
│   ├── about/
│   ├── contact/       reactive form with success toast
│   └── not-found/     404
├── layout/            header (cart badge from signal) · footer · main-layout
├── app.routes.ts
├── app.config.ts
├── app.component.ts
└── main.ts
```

## API endpoints used (4+ varied methods)

| Method | Endpoint | Where |
|---|---|---|
| **GET** | `/api/products/filter` | `shop` (full filter/sort/pagination), `home` (featured) |
| **GET** | `/api/products` | `home` (new arrivals) |
| **GET** | `/api/products/{id}` | `product-detail` |
| **GET** | `/api/products/search` | (available via `ProductService.search`) |
| **GET** | `/api/categories` | `home`, `shop` filters |
| **GET** | `/api/reviews/{productId}` | `product-detail` |
| **POST** | `/api/auth/login` | `login` page |
| **POST** | `/api/auth/register` | `register` page |
| **POST** | `/api/cart/add-to-cart` | `checkout` (sync local cart → server) |
| **POST** | `/api/users/checkout` | `checkout` (place order) |
| **PUT** | `/api/users` | `checkout` (save shipping fields to profile) |
| **PUT** | `/api/cart/edit-quantity` | `CartService.editServerQuantity()` |
| **DELETE** | `/api/cart/remove-from-cart/{productId}` | `CartService.removeServerItem()` |

The hybrid cart strategy: a guest's cart lives in `localStorage` via `signal<LocalCartItem[]>` + `effect()`. On checkout (when authenticated), each item is synced to the server with `POST /api/cart/add-to-cart`, then `POST /api/users/checkout` finalizes the order.

## Feature checklist — what is satisfied where

| Brief requirement | File / location |
|---|---|
| **Standalone components** (no NgModules) | every `*.component.ts` declares `standalone: true` |
| **TypeScript strict, no `any`** | [`tsconfig.json`](tsconfig.json) — `strict: true`; all models typed in `core/models/*` |
| **Signals everywhere state lives** | `cartItems` & derived `count`/`subtotal`/`total` in [`cart.service.ts`](src/app/core/services/cart.service.ts); `filters` signal in [`shop.component.ts`](src/app/features/shop/shop.component.ts); `auth` state in [`auth.service.ts`](src/app/core/services/auth.service.ts); `loading`/`product`/`gallery` etc. in `product-detail.component.ts` |
| **`computed()`** | `cartCount`, `cartTotal`, `cardRequired`, `gallery`, `specsList`, `sortKey`, `isAuthenticated` |
| **`effect()`** | [`cart.service.ts`](src/app/core/services/cart.service.ts) — syncs cart to `localStorage` |
| **Signal-based `input()` / `output()`** | [`product-card.component.ts`](src/app/shared/components/product-card.component.ts), `quantity-input`, `rating-stars`, `button`, `loader`, `empty-state`, `badge`, `skeleton-card`, `lazy-image.directive` |
| **`@Input` / `@Output` usage** | `<app-product-card [product]="p" (addToCart)="onAdd($event)">` in [`home.component.html`](src/app/features/home/home.component.html), `shop.component.html`, `product-detail.component.html` |
| **Custom pipe** | [`CurrencyGelPipe`](src/app/shared/pipes/currency-gel.pipe.ts) — `{{ price | gel }}` → `₾1,299` |
| **Built-in pipes** | `date` (review date), `number` (rating), `async`-style flows handled via signals; `slice` available in product-card title clamp via CSS, but `number:'1.1-1'` for star ratings |
| **Custom directive** | [`LazyImageDirective`](src/app/shared/directives/lazy-image.directive.ts) — `appLazyImage`, IntersectionObserver-based lazy loading + fade-in |
| **RxJS — `debounceTime + distinctUntilChanged + switchMap` on search** | [`shop.component.ts`](src/app/features/shop/shop.component.ts) — `searchInput$` pipeline |
| **RxJS — `combineLatest`** | [`home.component.ts`](src/app/features/home/home.component.ts) loads featured + new arrivals + categories together |
| **RxJS — `takeUntilDestroyed`** | every component subscribes through `takeUntilDestroyed(this.destroyRef)` |
| **RxJS — `map`, `tap`, `filter`** | `product.service.ts` (map), `shop.component.ts` (tap), `product-detail.component.ts` (filter on paramMap) |
| **Reactive Forms with validators** | [`checkout.component.ts`](src/app/features/cart/checkout.component.ts), [`contact.component.ts`](src/app/features/contact/contact.component.ts), `login`, `register` — `required`, `email`, `minLength`, `pattern` (phone, expiry, CVC) |
| **Custom validator (Luhn + trimmed)** | [`shared/validators/luhn.validator.ts`](src/app/shared/validators/luhn.validator.ts) — used on the credit-card field & all "name" fields |
| **HTTP interceptor — loading** | [`loading.interceptor.ts`](src/app/core/interceptors/loading.interceptor.ts) — `LoadingService` exposes `isLoading` signal, surfaced as a top-bar in `MainLayoutComponent` |
| **HTTP interceptor — error toast** | [`error.interceptor.ts`](src/app/core/interceptors/error.interceptor.ts) → `ToastService.error(...)` |
| **HTTP interceptor — auth (Bearer + X-API-KEY)** | [`auth.interceptor.ts`](src/app/core/interceptors/auth.interceptor.ts) |
| **Route guard** | [`cart-not-empty.guard.ts`](src/app/core/guards/cart-not-empty.guard.ts) on `/cart/checkout`; [`auth.guard.ts`](src/app/core/guards/auth.guard.ts) (available, opt-in for protected routes) |
| **DRY — shared components** | [`ProductCard`](src/app/shared/components/product-card.component.ts), `Button`, `Loader`, `EmptyState`, `QuantityInput`, `Badge`, `RatingStars`, `SkeletonCard`, `ToastContainer` — used across home, shop, detail, cart |
| **5+ pages, all working** | home, shop, shop/:id, cart, cart/checkout, login, register, about, contact, 404 |
| **4+ HTTP requests with varied methods** | GET / POST / PUT / DELETE — see endpoint table above |
| **Wildcard route → 404** | [`app.routes.ts`](src/app/app.routes.ts) — `path: '**'` |
| **Responsive 1/2/3–4 col grid** | `home.component.scss`, `shop.component.scss`, `product-detail.component.scss` — media queries at 1100px / 880px / 480px |
| **Sticky header with logo, nav, search, cart badge from signal** | [`header.component.ts`](src/app/layout/header/header.component.ts) — `position: sticky`, badge driven by `cart.count()` |
| **Hover effects, image zoom, skeleton loaders** | `product-card.component.ts` (hover scale), `skeleton-card.component.ts` (shimmer) |
| **Accessibility — focus rings, alt text, aria, semantic HTML** | global `:focus-visible` ring in `styles.scss`; `aria-label` on icon buttons; `<nav aria-label>`, `<main>`, `<article>`, `<aside>` everywhere |
| **Empty / error states** | `EmptyStateComponent` used in cart and shop (no-results) |
| **Design tokens (CSS vars)** | [`styles.scss`](src/styles.scss) `:root { --color-* / --radius-* / --shadow-* / --font-* }` |

## Vercel deployment

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com) click **New Project** → import the repo.
3. Vercel auto-detects Angular. Confirm:
   - **Build command:** `npm run build`
   - **Output directory:** `dist/step-tech-shop/browser`
4. The included [`vercel.json`](vercel.json) rewrites every path back to `index.html` so the SPA router handles deep links.
5. Click **Deploy**. Done.

## Notes / known caveats

- The Swagger spec doesn't formally describe the login response body — `AuthService` accepts `token`, `accessToken`, or `jwt` keys defensively.
- `POST /api/users/checkout` takes no body — the demo saves the form's shipping fields to the profile via `PUT /api/users` first, then calls checkout.
- Reviews are star-only on this API (no comment field), reflected in the UI.
- For guests, the order placement is simulated client-side after a brief delay so the demo runs end-to-end without an account.
