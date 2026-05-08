import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qty" role="group" [attr.aria-label]="'Quantity for ' + (label() || 'item')">
      <button type="button" class="qty__btn" (click)="dec()" [disabled]="atMin()" aria-label="Decrease">−</button>
      <span class="qty__val" aria-live="polite">{{ value() }}</span>
      <button type="button" class="qty__btn" (click)="inc()" [disabled]="atMax()" aria-label="Increase">+</button>
    </div>
  `,
  styles: [`
    .qty {
      display: inline-flex; align-items: center; gap: .25rem;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 999px; padding: .2rem;
      transition: border-color .25s;
    }
    .qty:hover { border-color: var(--color-border-strong); }
    .qty__btn {
      width: 2.1rem; height: 2.1rem; border: none; background: transparent; cursor: pointer;
      font-family: var(--font-mono); font-size: 1.05rem; line-height: 1; color: var(--color-text);
      border-radius: 999px;
      transition: background .25s, color .25s;
    }
    .qty__btn:not(:disabled):hover { background: var(--color-text); color: var(--color-bg); }
    .qty__btn:disabled { opacity: .35; cursor: not-allowed; }
    .qty__val { min-width: 2ch; text-align: center; font-family: var(--font-mono); font-weight: 500; }
  `]
})
export class QuantityInputComponent {
  readonly value = input.required<number>();
  readonly min = input<number>(1);
  readonly max = input<number>(99);
  readonly label = input<string>('');
  readonly valueChange = output<number>();

  readonly atMin = computed(() => this.value() <= this.min());
  readonly atMax = computed(() => this.value() >= this.max());

  inc(): void { if (!this.atMax()) this.valueChange.emit(this.value() + 1); }
  dec(): void { if (!this.atMin()) this.valueChange.emit(this.value() - 1); }
}
