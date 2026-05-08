import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class.badge--accent]="accent()"><ng-content /></span>`,
  styles: [`
    .badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 1.4rem; padding: 0 .5rem; height: 1.4rem;
      border-radius: 999px;
      background: var(--color-text); color: var(--color-bg);
      font-family: var(--font-mono); font-size: .7rem; font-weight: 500; line-height: 1;
    }
    .badge--accent { background: var(--color-accent); color: var(--color-surface); }
  `]
})
export class BadgeComponent {
  readonly accent = input<boolean>(false);
}
