import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { SavedOrder } from '../../core/models/order.model';
import { CurrencyGelPipe } from '../../shared/pipes/currency-gel.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';
import { ButtonComponent } from '../../shared/components/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-order-confirmed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, CurrencyGelPipe, TranslatePipe, LazyImageDirective, ButtonComponent, EmptyStateComponent],
  template: `
    @if (order(); as o) {
      <section class="confirm container">
        <header class="confirm__head">
          <p class="eyebrow">{{ 'confirm.eyebrow' | t }}</p>
          <h1>{{ 'confirm.thanks.a' | t }}<em>{{ o.contact.firstName }}</em>{{ 'confirm.thanks.b' | t }}</h1>
          <p class="confirm__lede">
            {{ 'confirm.lede.a' | t }}<span class="mono">{{ o.contact.email }}</span>{{ 'confirm.lede.b' | t }}
            @if (o.isGuest) { <span class="confirm__guest"> {{ 'confirm.guest' | t }}</span> }
          </p>
        </header>

        <div class="confirm__layout">
          <section class="block">
            <h2>{{ 'confirm.details' | t }}</h2>
            <dl class="meta">
              <div><dt>{{ 'confirm.orderId' | t }}</dt><dd class="mono">{{ o.id }}</dd></div>
              <div><dt>{{ 'confirm.placed' | t }}</dt><dd>{{ o.placedAt | date:'medium' }}</dd></div>
              <div><dt>{{ 'confirm.payment' | t }}</dt><dd>{{ o.paymentMethod === 'card' ? ('confirm.card' | t) : ('confirm.cod' | t) }}</dd></div>
            </dl>

            <h3 class="block__sub">{{ 'confirm.items' | t }}</h3>
            <ul class="lines" role="list">
              @for (it of o.items; track it.productId) {
                <li class="line">
                  <a class="line__media" [routerLink]="['/shop', it.productId]">
                    <img [appLazyImage]="it.imageUrl" [alt]="it.name" />
                  </a>
                  <div class="line__body">
                    <p class="line__brand">{{ it.brand }}</p>
                    <a [routerLink]="['/shop', it.productId]" class="line__name">{{ it.name }}</a>
                    <p class="line__qty">{{ it.quantity }} × {{ it.price | gel }}</p>
                  </div>
                  <span class="line__total">{{ (it.price * it.quantity) | gel }}</span>
                </li>
              }
            </ul>
          </section>

          <aside class="block summary">
            <h2>{{ 'confirm.summary' | t }}</h2>
            <div class="summary__row"><span>{{ 'cart.subtotal' | t }}</span><strong>{{ o.subtotal | gel }}</strong></div>
            <div class="summary__row"><span>{{ 'cart.shipping' | t }}</span><strong>{{ o.shipping === 0 ? ('cart.free' | t) : (o.shipping | gel) }}</strong></div>
            <div class="summary__row summary__row--total"><span>{{ 'cart.total' | t }}</span><strong>{{ o.total | gel }}</strong></div>

            <h3 class="block__sub">{{ 'confirm.shippingTo' | t }}</h3>
            <address class="addr">
              {{ o.contact.firstName }} {{ o.contact.lastName }}<br>
              {{ o.contact.address }}<br>
              <span class="mono">{{ o.contact.phone }}</span>
            </address>

            <a routerLink="/shop"><app-button variant="accent" size="lg">{{ 'confirm.continueShopping' | t }}</app-button></a>
          </aside>
        </div>
      </section>
    } @else {
      <section class="confirm container">
        <app-empty-state
          icon="—"
          [title]="'confirm.notFound.title' | t"
          [description]="'confirm.notFound.desc' | t">
          <a routerLink="/shop"><app-button variant="accent">{{ 'confirm.notFound.btn' | t }}</app-button></a>
        </app-empty-state>
      </section>
    }
  `,
  styles: [`
    .confirm { padding-block: clamp(3rem, 5vw, 5rem) 5rem; }
    .confirm__head { max-width: 880px; margin: 0 0 3rem; }
    .eyebrow {
      display: inline-block;
      font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
      color: var(--color-accent); font-weight: 500; margin: 0 0 1.2rem;
    }
    .confirm h1 {
      font-family: var(--font-display); font-weight: 400; margin: 0 0 1rem;
      font-size: clamp(2.6rem, 6vw, 4.2rem); letter-spacing: -.04em; line-height: .95;
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
    }
    .confirm h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .confirm__lede { color: var(--color-text-muted); margin: 0; font-size: 1.05rem; line-height: 1.6; }
    .confirm__guest { color: var(--color-text-dim); }
    .mono { font-family: var(--font-mono); font-size: .92em; }

    .confirm__layout {
      display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: start;
    }

    .block { padding: 0; }
    .block h2 {
      font-family: var(--font-display); font-weight: 400;
      margin: 0 0 1.2rem; font-size: 1.6rem; letter-spacing: -.025em;
    }
    .block__sub {
      font-family: var(--font-mono); font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
      color: var(--color-text-muted); font-weight: 500; margin: 1.6rem 0 .8rem;
    }

    .meta { display: grid; gap: 0; margin: 0 0 .5rem; }
    .meta > div { display: grid; grid-template-columns: 140px 1fr; gap: 1rem; padding: .8rem 0; border-top: 1px solid var(--color-border); }
    .meta > div:first-child { border-top: none; padding-top: 0; }
    .meta dt { color: var(--color-text-muted); margin: 0; font-family: var(--font-mono); font-size: .82rem; }
    .meta dd { margin: 0; color: var(--color-text); }

    .lines { list-style: none; padding: 0; margin: 0; display: grid; gap: 0; border-top: 1px solid var(--color-border); }
    .line {
      display: grid; grid-template-columns: 88px 1fr auto; gap: 1.2rem;
      align-items: center;
      padding: 1.1rem 0; border-bottom: 1px solid var(--color-border);
    }
    .line__media { display: block; aspect-ratio: 1; border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface); }
    .line__media img { width: 100%; height: 100%; object-fit: cover; }
    .line__body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
    .line__brand { margin: 0; font-family: var(--font-mono); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-muted); }
    .line__name {
      color: var(--color-text); text-decoration: none;
      font-family: var(--font-display); font-weight: 400; font-size: 1.05rem; letter-spacing: -.015em;
    }
    .line__name:hover { color: var(--color-accent); }
    .line__qty { margin: 0; font-family: var(--font-mono); font-size: .82rem; color: var(--color-text-muted); }
    .line__total { font-family: var(--font-mono); font-size: 1.05rem; font-weight: 500; }

    .summary {
      position: sticky; top: 100px;
      padding: 1.8rem; background: var(--color-surface); border-radius: var(--radius-lg);
      display: flex; flex-direction: column; gap: .65rem;
    }
    .summary h2 { margin: 0 0 .4rem; font-size: 1.4rem; }
    .summary__row { display: flex; justify-content: space-between; color: var(--color-text-muted); font-family: var(--font-mono); font-size: .9rem; }
    .summary__row strong { color: var(--color-text); font-weight: 500; }
    .summary__row--total { font-size: 1.05rem; padding-top: .9rem; margin-top: .35rem; border-top: 1px solid var(--color-border); }
    .summary__row--total strong { font-family: var(--font-display); font-size: 1.7rem; color: var(--color-text); font-weight: 500; }

    .addr {
      font-style: normal; line-height: 1.55;
      padding: .9rem 1rem; background: var(--color-bg); border-radius: var(--radius-md);
      font-size: .92rem; color: var(--color-text);
    }

    @media (max-width: 880px) {
      .confirm__layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
    @media (max-width: 540px) {
      .line { grid-template-columns: 64px 1fr; }
      .line__total { grid-column: 2; justify-self: flex-end; }
    }
  `]
})
export class OrderConfirmedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderService);

  readonly order = signal<SavedOrder | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.order.set(this.orders.findLocal(id));
  }
}
