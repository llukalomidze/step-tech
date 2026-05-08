import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader" role="status" [attr.aria-label]="label()">
      <span class="loader__bar"></span>
      <span class="loader__bar"></span>
      <span class="loader__bar"></span>
      <span class="loader__bar"></span>
    </div>
  `,
  styles: [`
    :host { display: inline-flex; }
    .loader { display: inline-flex; gap: .25rem; align-items: flex-end; height: 18px; }
    .loader__bar {
      width: 3px; background: var(--color-text); border-radius: 2px;
      animation: pulseBar .9s var(--ease-out-expo) infinite;
    }
    .loader__bar:nth-child(1) { height: 50%; animation-delay: 0s; }
    .loader__bar:nth-child(2) { height: 80%; animation-delay: .12s; }
    .loader__bar:nth-child(3) { height: 60%; animation-delay: .24s; }
    .loader__bar:nth-child(4) { height: 90%; animation-delay: .36s; }
    @keyframes pulseBar {
      0%, 100% { transform: scaleY(.4); opacity: .55; }
      50%      { transform: scaleY(1); opacity: 1; }
    }
  `]
})
export class LoaderComponent {
  readonly label = input<string>('Loading');
}
