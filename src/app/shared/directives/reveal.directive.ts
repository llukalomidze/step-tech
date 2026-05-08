import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

type RevealMode = 'up' | 'fade' | 'left' | 'right' | 'zoom';

/** Bare attribute usage (`appReveal` with no value) sends `""` — coerce to default. */
function toMode(v: string | RevealMode): RevealMode {
  return v && v !== '' ? (v as RevealMode) : 'up';
}

/**
 * appReveal — adds .is-revealed when the element scrolls into view.
 * Pair with `data-reveal="<mode>"` (set automatically) and the global CSS
 * transitions in styles.scss. The mode picks which transform animates in.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: {
    '[attr.data-reveal]': 'mode()',
  }
})
export class RevealDirective implements OnInit, OnDestroy {
  readonly mode = input<RevealMode, string | RevealMode>('up', { alias: 'appReveal', transform: toMode });
  readonly threshold = input<number>(0.15);
  readonly rootMargin = input<string>('0px 0px -8% 0px');
  readonly once = input<boolean>(true);

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const el = this.host.nativeElement;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-revealed'); return; }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-revealed');
            if (this.once()) this.observer?.disconnect();
          } else if (!this.once()) {
            el.classList.remove('is-revealed');
          }
        }
      },
      { threshold: this.threshold(), rootMargin: this.rootMargin() }
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}

/**
 * appRevealStagger — same trigger, but the host fades its direct children in
 * sequence using CSS variables. Apply on grids and lists.
 */
@Directive({
  selector: '[appRevealStagger]',
  standalone: true,
  host: { '[attr.data-reveal-stagger]': '"true"' }
})
export class RevealStaggerDirective implements OnInit, OnDestroy {
  readonly threshold = input<number>(0.1);
  readonly rootMargin = input<string>('0px 0px -8% 0px');

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const el = this.host.nativeElement;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-revealed'); return; }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-revealed');
            this.observer?.disconnect();
          }
        }
      },
      { threshold: this.threshold(), rootMargin: this.rootMargin() }
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}
