import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (_ of placeholders(); track $index) {
      <div class="skel">
        <div class="skel__media"></div>
        <div class="skel__body">
          <div class="skel__line skel__line--xs"></div>
          <div class="skel__line"></div>
          <div class="skel__line skel__line--md"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .skel { background: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; }
    .skel__media {
      aspect-ratio: 4/5;
      background: linear-gradient(90deg, var(--color-surface-2), var(--color-border), var(--color-surface-2));
      background-size: 200% 100%;
      animation: shimmer 1.6s linear infinite;
    }
    .skel__body { padding: 1.1rem .15rem 0; display: flex; flex-direction: column; gap: .55rem; }
    .skel__line {
      height: 12px; border-radius: 999px;
      background: linear-gradient(90deg, var(--color-surface-2), var(--color-border), var(--color-surface-2));
      background-size: 200% 100%;
      animation: shimmer 1.6s linear infinite;
    }
    .skel__line--xs { width: 30%; height: 8px; }
    .skel__line--md { width: 60%; }
  `]
})
export class SkeletonCardComponent {
  readonly count = input<number>(8);
  placeholders(): readonly null[] { return Array.from({ length: this.count() }, () => null); }
}
