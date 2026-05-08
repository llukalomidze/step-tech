import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="stars" [attr.aria-label]="value() + ' out of 5'">
      <span class="stars__bg" aria-hidden="true">★★★★★</span>
      <span class="stars__fg" [style.width.%]="percent()" aria-hidden="true">★★★★★</span>
    </span>
  `,
  styles: [`
    .stars { position: relative; display: inline-block; font-size: 1rem; line-height: 1; letter-spacing: 2px; }
    .stars__bg { color: var(--color-border); }
    .stars__fg {
      position: absolute; inset: 0; overflow: hidden; white-space: nowrap;
      color: var(--color-rating);
    }
  `]
})
export class RatingStarsComponent {
  readonly value = input<number>(0);
  readonly percent = computed(() => Math.max(0, Math.min(5, this.value())) * 20);
}
