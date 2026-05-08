import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <div class="empty__icon" aria-hidden="true">{{ icon() }}</div>
      <h3 class="empty__title">{{ title() }}</h3>
      @if (description()) { <p class="empty__desc">{{ description() }}</p> }
      <div class="empty__actions"><ng-content /></div>
    </div>
  `,
  styles: [`
    .empty {
      display: flex; flex-direction: column; align-items: center; gap: .9rem;
      padding: 5rem 1.5rem; text-align: center;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      animation: fadeUp .6s var(--ease-out-expo);
    }
    .empty__icon {
      font-family: var(--font-display); font-size: 4rem;
      font-style: italic; color: var(--color-accent);
      font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    }
    .empty__title {
      color: var(--color-text); font-family: var(--font-display);
      margin: 0; font-size: 1.6rem; letter-spacing: -.025em; font-weight: 400;
      font-variation-settings: 'opsz' 144, 'SOFT' 60, 'WONK' 0;
    }
    .empty__desc { color: var(--color-text-muted); margin: 0; max-width: 42ch; line-height: 1.55; }
    .empty__actions { margin-top: .5rem; display: flex; gap: .5rem; }
  `]
})
export class EmptyStateComponent {
  readonly icon = input<string>('—');
  readonly title = input<string>('Nothing here yet');
  readonly description = input<string>('');
}
