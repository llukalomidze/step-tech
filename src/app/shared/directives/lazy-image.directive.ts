import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * appLazyImage — uses IntersectionObserver to swap the real src in only when
 * the <img> enters the viewport. Adds .is-loaded once decoded for fade-in.
 *
 *   <img appLazyImage [src]="product.imageUrl" alt="...">
 */
@Directive({
  selector: 'img[appLazyImage]',
  standalone: true,
  host: {
    '[attr.loading]': '"lazy"',
    '[attr.decoding]': '"async"',
    '[class.lazy-img]': 'true'
  }
})
export class LazyImageDirective implements OnInit, OnDestroy {
  readonly src = input<string | null>(null, { alias: 'appLazyImage' });

  private readonly host = inject(ElementRef<HTMLImageElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const el = this.host.nativeElement;
    el.addEventListener('load', () => el.classList.add('is-loaded'));

    if (!('IntersectionObserver' in window)) { this.applySrc(); return; }

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.applySrc();
          this.observer?.disconnect();
          break;
        }
      }
    }, { rootMargin: '200px' });
    this.observer.observe(el);
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }

  private applySrc(): void {
    const value = this.src();
    if (value) this.host.nativeElement.src = value;
  }
}
