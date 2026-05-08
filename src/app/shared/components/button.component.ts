import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="'btn btn--' + variant() + ' btn--' + size()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() ? 'true' : null"
      (click)="clicked.emit($event)">
      @if (loading()) { <span class="btn__spinner" aria-hidden="true"></span> }
      <span class="btn__label"><ng-content /></span>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: .55rem;
      font-family: inherit; font-weight: 500; letter-spacing: -.005em;
      border: 1px solid transparent; border-radius: 999px;
      cursor: pointer; white-space: nowrap;
      transition: background .25s var(--ease-soft), color .25s var(--ease-soft),
                  border-color .25s var(--ease-soft), transform .35s var(--ease-out-quint),
                  box-shadow .35s var(--ease-soft);
    }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn:not(:disabled):active { transform: translateY(1px); }
    .btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }

    .btn--sm { padding: .55rem 1.1rem; font-size: .82rem; }
    .btn--md { padding: .8rem 1.5rem; font-size: .9rem; }
    .btn--lg { padding: 1.05rem 2rem; font-size: .98rem; }

    /* Primary = solid ink button on cream */
    .btn--primary { background: var(--color-text); color: var(--color-bg); }
    .btn--primary:not(:disabled):hover { background: var(--color-accent-strong); color: var(--color-surface); }

    /* Accent = warm terracotta — present, not eye-stabbing */
    .btn--accent { background: var(--color-accent); color: var(--color-surface); }
    .btn--accent:not(:disabled):hover { background: var(--color-accent-strong); transform: translateY(-1px); box-shadow: var(--shadow-md); }

    /* Secondary = paper button with ink outline */
    .btn--secondary { background: var(--color-surface); color: var(--color-text); border-color: var(--color-border-strong); }
    .btn--secondary:not(:disabled):hover { border-color: var(--color-text); }

    /* Ghost = text-only, picks up an accent underline on hover */
    .btn--ghost { background: transparent; color: var(--color-text); }
    .btn--ghost:not(:disabled):hover { background: var(--color-surface-2); }

    .btn--danger { background: var(--color-danger); color: var(--color-surface); }
    .btn--danger:not(:disabled):hover { background: oklch(0.48 0.16 25); }

    .btn__spinner {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid currentColor; border-right-color: transparent;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly clicked = output<MouseEvent>();
}
