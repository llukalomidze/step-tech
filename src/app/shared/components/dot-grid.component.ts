import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

interface Dot { readonly ox: number; readonly oy: number; x: number; y: number; }

/**
 * Fixed-position canvas dot grid that gently displaces dots away from the
 * cursor. Sits behind page content; only visible in negative space (cards have
 * solid backgrounds and cover it). Uses --color-border-strong so it doesn't
 * introduce a new colour and disturb the palette balance.
 */
@Component({
  selector: 'app-dot-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
    canvas { width: 100%; height: 100%; display: block; }
  `]
})
export class DotGridComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private readonly canvas!: ElementRef<HTMLCanvasElement>;
  private readonly zone = inject(NgZone);

  /* Tunables */
  private readonly spacing = 36;        // px between dots
  private readonly dotRadius = 1.3;     // px — at rest
  private readonly maxRadius = 2.4;     // px — peak size near cursor
  private readonly influence = 190;     // px — radius of cursor effect
  private readonly maxOffset = 28;      // px — max displacement near cursor
  private readonly lerp = 0.22;         // smoothing factor per frame

  private ctx: CanvasRenderingContext2D | null = null;
  private dots: Dot[] = [];
  private mouseX = Number.NEGATIVE_INFINITY;
  private mouseY = Number.NEGATIVE_INFINITY;
  private rafId = 0;
  private dotColor = 'rgba(120,128,150,0.5)';
  private reduce = false;

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    if (!this.ctx) return;

    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.dotColor = this.readDotColor();

    this.resize();
    this.buildDots();

    /* Run the loop and listeners outside Angular so we don't trigger CD per frame. */
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      window.addEventListener('mouseleave', this.onMouseLeave);
      window.addEventListener('resize', this.onResize);
      this.rafId = requestAnimationFrame(this.tick);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseleave', this.onMouseLeave);
    window.removeEventListener('resize', this.onResize);
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };
  private onMouseLeave = (): void => {
    this.mouseX = Number.NEGATIVE_INFINITY;
    this.mouseY = Number.NEGATIVE_INFINITY;
  };
  private onResize = (): void => { this.resize(); this.buildDots(); };

  private resize(): void {
    const c = this.canvas.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private buildDots(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dots: Dot[] = [];
    for (let y = this.spacing / 2; y < h; y += this.spacing) {
      for (let x = this.spacing / 2; x < w; x += this.spacing) {
        dots.push({ ox: x, oy: y, x, y });
      }
    }
    this.dots = dots;
  }

  private tick = (): void => {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = this.dotColor;

    const mx = this.mouseX;
    const my = this.mouseY;
    const inf = this.influence;
    const inf2 = inf * inf;

    const baseR = this.dotRadius;
    const peakR = this.maxRadius;

    for (const d of this.dots) {
      let tx = d.ox;
      let ty = d.oy;
      let r = baseR;

      if (!this.reduce && Number.isFinite(mx)) {
        const dx = d.ox - mx;
        const dy = d.oy - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < inf2) {
          const dist = Math.sqrt(d2) || 0.0001;
          /* Quadratic falloff so the effect tightens near the cursor. */
          const t = 1 - dist / inf;
          const force = t * t * this.maxOffset;
          tx = d.ox + (dx / dist) * force;
          ty = d.oy + (dy / dist) * force;
          /* Linear size easing — a touch of swell, not a pulse. */
          r = baseR + (peakR - baseR) * t;
        }
      }

      d.x += (tx - d.x) * this.lerp;
      d.y += (ty - d.y) * this.lerp;

      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  /** Resolves --color-border-strong to a fillable canvas colour. The token is
   *  oklch(); modern browsers can render it directly inside fillStyle, but we
   *  fall back to a hard-coded slate-grey so it never silently disappears. */
  private readDotColor(): string {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-border-strong').trim();
    return raw || 'rgba(140, 148, 168, 0.55)';
  }
}
