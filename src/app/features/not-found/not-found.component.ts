import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, TranslatePipe],
  template: `
    <section class="nf">
      <div class="container nf__inner">
        <p class="nf__code" aria-hidden="true">
          <span>4</span><span class="nf__zero"><em>0</em></span><span>4</span>
        </p>
        <p class="eyebrow">{{ 'nf.eyebrow' | t }}</p>
        <h1>{{ 'nf.title.a' | t }}<em>{{ 'nf.title.em' | t }}</em>{{ 'nf.title.b' | t }}</h1>
        <p class="nf__msg">{{ 'nf.msg' | t }}</p>
        <div class="nf__cta">
          <a routerLink="/"><app-button variant="accent" size="lg">{{ 'nf.backHome' | t }}</app-button></a>
          <a routerLink="/shop"><app-button variant="ghost" size="lg">{{ 'nf.browse' | t }}</app-button></a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .nf { padding: 6rem 0; display: flex; justify-content: center; min-height: 80vh; align-items: center; }
    .nf__inner { text-align: left; max-width: 760px; }
    .nf__code {
      display: flex; gap: .04em; align-items: baseline;
      font-family: var(--font-display); font-weight: 400;
      font-size: clamp(5rem, 22vw, 16rem);
      line-height: .82; letter-spacing: -.08em; margin: 0 0 1.4rem;
      color: var(--color-text);
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
      animation: fadeUp .9s var(--ease-out-expo);
    }
    .nf__zero em {
      font-style: italic; color: var(--color-accent);
      font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    }
    .eyebrow {
      display: inline-block;
      font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
      color: var(--color-text-muted); margin: 0 0 1rem; font-weight: 500;
    }
    h1 {
      font-family: var(--font-display); font-weight: 400;
      margin: 0 0 1.2rem;
      font-size: clamp(2rem, 5vw, 3.4rem); letter-spacing: -.04em; line-height: 1;
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
    }
    h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .nf__msg { color: var(--color-text-muted); margin: 0 0 2rem; line-height: 1.6; max-width: 50ch; }
    .nf__cta { display: inline-flex; gap: .8rem; flex-wrap: wrap; }
  `]
})
export class NotFoundComponent {}
