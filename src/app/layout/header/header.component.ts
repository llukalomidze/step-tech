import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LangToggleComponent } from '../../shared/components/lang-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule, TranslatePipe, LangToggleComponent],
  template: `
    <header class="hdr">
      <div class="hdr__inner container">
        <a routerLink="/" class="hdr__logo" aria-label="STEP TECH home">
          <span class="hdr__logo-mark" aria-hidden="true">✦</span>
          <span class="hdr__logo-text">Step <em>Tech</em></span>
        </a>

        <nav class="hdr__nav" aria-label="Main">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">{{ 'nav.home' | t }}</a>
          <a routerLink="/shop" routerLinkActive="is-active">{{ 'nav.shop' | t }}</a>
          <a routerLink="/about" routerLinkActive="is-active">{{ 'nav.about' | t }}</a>
          <a routerLink="/contact" routerLinkActive="is-active">{{ 'nav.contact' | t }}</a>
        </nav>

        <div class="hdr__actions">
          <form class="hdr__search" role="search" (ngSubmit)="submitSearch()">
            <span class="hdr__search-ico" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="search" name="q" [(ngModel)]="query" [placeholder]="'header.search' | t" [attr.aria-label]="'header.search' | t" autocomplete="off" />
          </form>

          <app-lang-toggle class="hdr__lang" />

          @if (auth.isAuthenticated()) {
            <button class="hdr__icon" type="button" (click)="logout()" [attr.aria-label]="('header.signOut' | t) + ' ' + auth.userEmail()" [title]="'header.signOut' | t">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          } @else {
            <a routerLink="/login" class="hdr__icon" [attr.aria-label]="'header.signIn' | t" [title]="'header.signIn' | t">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
          }

          <a routerLink="/cart" class="hdr__cart" [attr.aria-label]="'header.bag' | t">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span class="hdr__cart-label">{{ 'header.bag' | t }}</span>
            @if (cart.count() > 0) { <span class="hdr__cart-badge">{{ cart.count() }}</span> }
          </a>

          <button class="hdr__icon hdr__menu" type="button" (click)="toggleMobile()" aria-label="Toggle menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <nav class="hdr__mobile" aria-label="Mobile">
          <form class="hdr__mobile-search" role="search" (ngSubmit)="submitSearch(); closeMobile()">
            <span class="hdr__search-ico" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="search" name="q" [(ngModel)]="query" [placeholder]="'header.search' | t" [attr.aria-label]="'header.search' | t" autocomplete="off" />
          </form>
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobile()">{{ 'nav.home' | t }}</a>
          <a routerLink="/shop" routerLinkActive="is-active" (click)="closeMobile()">{{ 'nav.shop' | t }}</a>
          <a routerLink="/about" routerLinkActive="is-active" (click)="closeMobile()">{{ 'nav.about' | t }}</a>
          <a routerLink="/contact" routerLinkActive="is-active" (click)="closeMobile()">{{ 'nav.contact' | t }}</a>
          <div class="hdr__mobile-lang"><app-lang-toggle /></div>
        </nav>
      }
    </header>
  `,
  styles: [`
    :host { display: block; position: sticky; top: 0; z-index: 50; }

    .hdr {
      background: color-mix(in oklch, var(--color-bg) 85%, transparent);
      backdrop-filter: saturate(180%) blur(12px);
      -webkit-backdrop-filter: saturate(180%) blur(12px);
      border-bottom: 1px solid var(--color-border);
    }
    .hdr__inner { display: flex; align-items: center; gap: 1.6rem; padding: 1.05rem 0; }

    .hdr__logo { display: inline-flex; align-items: baseline; gap: .5rem; text-decoration: none; color: var(--color-text); }
    .hdr__logo-mark {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px;
      color: var(--color-accent);
      font-size: 1.5rem; line-height: 1; transform: translateY(2px);
      transition: transform .35s var(--ease-out-expo);
    }
    .hdr__logo:hover .hdr__logo-mark { transform: translateY(2px) rotate(72deg); }
    .hdr__logo-text {
      font-family: var(--font-display); font-weight: 500;
      letter-spacing: -.025em; font-size: 1.4rem;
      font-variation-settings: 'opsz' 144, 'SOFT' 50, 'WONK' 1;
    }
    .hdr__logo-text em {
      font-style: italic; font-weight: 400;
      font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    }

    .hdr__nav { display: flex; gap: 2rem; flex: 1; justify-content: center; }
    .hdr__nav a {
      position: relative; color: var(--color-text-muted); text-decoration: none;
      font-weight: 500; font-size: .94rem; padding: .5rem 0;
      transition: color .25s var(--ease-soft);
    }
    .hdr__nav a::after {
      content: ''; position: absolute; left: 0; bottom: 6px;
      width: 0; height: 1px; background: var(--color-text);
      transition: width .35s var(--ease-out-quint);
    }
    .hdr__nav a:hover { color: var(--color-text); }
    .hdr__nav a:hover::after { width: 100%; }
    .hdr__nav a.is-active { color: var(--color-text); }
    .hdr__nav a.is-active::after { width: 100%; background: var(--color-accent); height: 2px; }

    .hdr__actions { display: flex; align-items: center; gap: .5rem; }

    .hdr__search {
      display: flex; align-items: center; gap: .5rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 999px; padding: .35rem .9rem;
      transition: border-color .25s, box-shadow .25s;
    }
    .hdr__search:focus-within { border-color: var(--color-text); box-shadow: 0 0 0 4px var(--color-accent-soft); }
    .hdr__search-ico { color: var(--color-text-muted); display: inline-flex; }
    .hdr__search input {
      border: none; background: transparent; outline: none; color: var(--color-text);
      width: 12ch; font-size: .9rem; padding: .3rem 0;
      transition: width .35s var(--ease-out-quint);
    }
    .hdr__search input::placeholder { color: var(--color-text-dim); }
    .hdr__search input:focus { width: 18ch; }

    .hdr__icon, .hdr__cart {
      position: relative; display: inline-flex; align-items: center; gap: .5rem;
      height: 2.4rem; padding: 0 1rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-text);
      cursor: pointer; text-decoration: none; font-size: .88rem; font-weight: 500;
      transition: border-color .25s, background .25s, color .25s, transform .25s var(--ease-out-quint);
    }
    .hdr__icon { width: 2.4rem; padding: 0; justify-content: center; }
    .hdr__icon:hover, .hdr__cart:hover { border-color: var(--color-text); background: var(--color-elevated); transform: translateY(-1px); }
    .hdr__cart { padding-right: 1.05rem; }
    .hdr__cart-label { letter-spacing: -.005em; }
    .hdr__cart-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 1.35rem; height: 1.35rem; padding: 0 .42rem;
      background: var(--color-accent); color: var(--color-surface);
      border-radius: 999px; font-family: var(--font-mono); font-size: .7rem; font-weight: 600; line-height: 1;
    }
    .hdr__menu { display: none; }

    .hdr__mobile { display: none; flex-direction: column; padding: .25rem 0 1rem; border-top: 1px solid var(--color-border); background: var(--color-surface); }
    .hdr__mobile a { padding: 1rem 1.2rem; color: var(--color-text); text-decoration: none; font-family: var(--font-display); font-size: 1.4rem; letter-spacing: -.02em; border-bottom: 1px solid var(--color-border); }
    .hdr__mobile a.is-active { color: var(--color-accent); }
    .hdr__mobile-search {
      display: flex; align-items: center; gap: .55rem;
      margin: .5rem 1.2rem; padding: .5rem .9rem;
      background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 999px;
    }
    .hdr__mobile-search:focus-within { border-color: var(--color-text); box-shadow: 0 0 0 3px var(--color-accent-soft); }
    .hdr__mobile-search input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; padding: .35rem 0; font-size: .95rem; color: var(--color-text); }

    @media (max-width: 960px) {
      .hdr__nav { display: none; }
      .hdr__menu { display: inline-flex; }
      .hdr__mobile { display: flex; }
      .hdr__cart-label { display: none; }
      .hdr__cart { padding: 0 .9rem; }
      .hdr__search input { width: 9ch; }
    }
    @media (max-width: 720px) {
      .hdr__inner { gap: .8rem; padding: .85rem 0; }
      .hdr__actions { gap: .35rem; }
      .hdr__search { display: none; }
      .hdr__lang { display: none; }
      .hdr__icon, .hdr__cart { height: 2.2rem; padding: 0 .75rem; }
      .hdr__icon { width: 2.2rem; padding: 0; }
    }
    @media (max-width: 380px) {
      .hdr__logo-text { font-size: 1.15rem; }
      .hdr__logo-mark { width: 22px; height: 22px; font-size: 1.2rem; }
    }
    .hdr__mobile-lang { padding: 1rem 1.2rem; }
  `]
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  query = '';
  readonly mobileOpen = signal(false);
  readonly hasItems = computed(() => this.cart.count() > 0);

  submitSearch(): void {
    const q = this.query.trim(); if (!q) return;
    void this.router.navigate(['/shop'], { queryParams: { q } });
  }
  logout(): void { this.auth.logout(); void this.router.navigate(['/']); }
  toggleMobile(): void { this.mobileOpen.update((v) => !v); }
  closeMobile(): void { this.mobileOpen.set(false); }
}
