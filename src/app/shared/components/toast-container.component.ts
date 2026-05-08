import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" role="region" aria-live="polite" aria-label="Notifications">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast--' + t.kind">
          <span class="toast__bar" aria-hidden="true"></span>
          <span class="toast__msg">{{ t.message }}</span>
          <button class="toast__close" type="button" (click)="toast.dismiss(t.id)" aria-label="Dismiss">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts {
      position: fixed; right: 1.2rem; bottom: 1.2rem; z-index: 1000;
      display: flex; flex-direction: column; gap: .55rem; max-width: min(92vw, 380px);
    }
    .toast {
      position: relative; overflow: hidden;
      display: flex; gap: .8rem; align-items: center;
      padding: .9rem 1rem .9rem 1.4rem;
      border-radius: var(--radius-md);
      background: var(--color-surface); color: var(--color-text);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      animation: slideIn .35s var(--ease-out-quint);
    }
    .toast__bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--color-text); }
    .toast--success .toast__bar { background: var(--color-success); }
    .toast--error   .toast__bar { background: var(--color-danger); }
    .toast--info    .toast__bar { background: var(--color-accent); }
    .toast__msg { flex: 1; font-size: .92rem; line-height: 1.4; }
    .toast__close { background: transparent; border: 0; color: var(--color-text-muted); cursor: pointer; font-size: .9rem; padding: .25rem; border-radius: 999px; }
    .toast__close:hover { color: var(--color-text); background: var(--color-surface-2); }
    @keyframes slideIn {
      from { transform: translateX(40px); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);
}
