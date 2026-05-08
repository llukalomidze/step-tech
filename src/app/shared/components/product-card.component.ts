import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CurrencyGelPipe } from '../pipes/currency-gel.pipe';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LazyImageDirective } from '../directives/lazy-image.directive';
import { RatingStarsComponent } from './rating-stars.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe, CurrencyGelPipe, TranslatePipe, LazyImageDirective, RatingStarsComponent],
  template: `
    <article class="card">
      <a class="card__media" [routerLink]="['/shop', product().id]" [attr.aria-label]="product().name">
        @if (product().stock <= 0) {
          <span class="card__tag card__tag--out">{{ 'card.soldOut' | t }}</span>
        } @else if (product().rating >= 4.5) {
          <span class="card__tag">{{ 'card.editorsPick' | t }}</span>
        }
        <img [appLazyImage]="product().imageUrl" alt="" />
      </a>

      <div class="card__body">
        <p class="card__brand">{{ product().brand }} <span class="card__brand-sep">/</span> {{ product().category.name }}</p>
        <a class="card__title" [routerLink]="['/shop', product().id]">
          <span class="card__title-text">{{ product().name }}</span>
        </a>
        <div class="card__meta">
          <app-rating-stars [value]="product().rating" />
          <span class="card__rating-num">{{ product().rating | number:'1.1-1' }}</span>
        </div>
        <div class="card__row">
          <span class="card__price">{{ product().price | gel }}</span>
          <button class="card__cta" type="button"
                  [disabled]="product().stock <= 0"
                  (click)="addToCart.emit(product())"
                  [attr.aria-label]="'card.addToBag' | t">
            {{ 'card.addToBag' | t }}
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .card {
      position: relative; display: flex; flex-direction: column;
      min-width: 0;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform .5s var(--ease-out-expo), box-shadow .5s var(--ease-soft);
    }
    .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

    .card__media {
      position: relative; aspect-ratio: 4/5; overflow: hidden; display: block;
      background: var(--color-surface-2);
    }
    .card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform .9s var(--ease-out-expo); }
    .card:hover .card__media img { transform: scale(1.06); }

    .card__tag {
      position: absolute; top: .9rem; left: .9rem; z-index: 1;
      padding: .35rem .65rem; border-radius: 999px;
      font-family: var(--font-mono); font-size: .68rem; font-weight: 500;
      letter-spacing: .12em; text-transform: uppercase;
      background: var(--color-surface); color: var(--color-text);
      box-shadow: var(--shadow-sm);
    }
    .card__tag--out { background: var(--color-text); color: var(--color-bg); }

    .card__body { padding: 1.1rem .15rem .15rem; display: flex; flex-direction: column; gap: .35rem; min-width: 0; }
    .card__brand {
      margin: 0; font-family: var(--font-mono); font-size: .7rem;
      letter-spacing: .12em; text-transform: uppercase; color: var(--color-text-muted);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .card__brand-sep { color: var(--color-text-dim); margin: 0 .25em; }

    .card__title {
      color: var(--color-text); text-decoration: none;
      font-family: var(--font-display); font-weight: 400; font-size: 1.18rem;
      letter-spacing: -.018em; line-height: 1.25;
      display: block;
      font-variation-settings: 'opsz' 144, 'SOFT' 60, 'WONK' 0;
      overflow-wrap: anywhere;
      hyphens: auto;
    }
    .card__title-text {
      background-image: linear-gradient(currentColor, currentColor);
      background-size: 0% 1px; background-repeat: no-repeat; background-position: 0 100%;
      transition: background-size .45s var(--ease-out-quint);
      padding-bottom: 1px;
    }
    .card:hover .card__title-text { background-size: 100% 1px; }

    .card__meta {
      display: flex; align-items: center; gap: .55rem;
      font-size: .85rem; color: var(--color-text-muted);
    }
    .card__rating-num { font-family: var(--font-mono); font-size: .8rem; }

    .card__row {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: .55rem;
    }
    .card__price {
      font-family: var(--font-mono); font-weight: 500; font-size: 1rem;
      color: var(--color-text); letter-spacing: -.01em;
    }
    .card__cta {
      border: 1px solid var(--color-border-strong); background: transparent;
      color: var(--color-text);
      padding: .45rem .9rem; border-radius: 999px;
      font-family: var(--font-base); font-weight: 500; font-size: .82rem;
      cursor: pointer;
      transition: background .25s, color .25s, border-color .25s, transform .25s var(--ease-out-quint);
    }
    .card__cta:not(:disabled):hover {
      background: var(--color-text); color: var(--color-bg); border-color: var(--color-text);
      transform: translateY(-1px);
    }
    .card__cta:disabled { opacity: .4; cursor: not-allowed; }
  `]
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly addToCart = output<Product>();
}
