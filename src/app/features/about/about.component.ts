import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button.component';
import { RevealDirective, RevealStaggerDirective } from '../../shared/directives/reveal.directive';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, RevealDirective, RevealStaggerDirective, TranslatePipe],
  template: `
    <section class="about">
      <div class="container about__hero">
        <p class="eyebrow">{{ 'about.eyebrow' | t }}</p>
        <h1>{{ 'about.title.a' | t }}<em>{{ 'about.title.em' | t }}</em>{{ 'about.title.b' | t }}</h1>
        <p class="lede">{{ 'about.lede' | t }}</p>
      </div>

      <div class="band" aria-hidden="true">
        <div class="marquee">
          @for (_ of [1,2,3]; track $index) {
            <span><em>{{ 'home.band.curated' | t }}</em></span><span>·</span>
            <span>{{ 'home.band.honest' | t }}</span><span>·</span>
            <span><em>{{ 'home.band.fair' | t }}</em> {{ 'home.band.pricing' | t }}</span><span>·</span>
            <span>{{ 'home.band.local' | t }}</span><span>·</span>
          }
        </div>
      </div>

      <div class="container about__principles" appRevealStagger>
        <article class="principle">
          <span class="principle__num">01</span>
          <h3>{{ 'about.p1.title' | t }}</h3>
          <p>{{ 'about.p1.body' | t }}</p>
        </article>
        <article class="principle">
          <span class="principle__num">02</span>
          <h3>{{ 'about.p2.title' | t }}</h3>
          <p>{{ 'about.p2.body' | t }}</p>
        </article>
        <article class="principle">
          <span class="principle__num">03</span>
          <h3>{{ 'about.p3.title' | t }}</h3>
          <p>{{ 'about.p3.body' | t }}</p>
        </article>
        <article class="principle">
          <span class="principle__num">04</span>
          <h3>{{ 'about.p4.title' | t }}</h3>
          <p>{{ 'about.p4.body' | t }}</p>
        </article>
      </div>

      <div class="container about__numbers" appReveal="up">
        <div><span class="num__label">{{ 'about.numbers.founded' | t }}</span><strong>2020</strong></div>
        <div><span class="num__label">{{ 'about.numbers.products' | t }}</span><strong>1.2k</strong></div>
        <div><span class="num__label">{{ 'about.numbers.customers' | t }}</span><strong>40k</strong></div>
        <div><span class="num__label">{{ 'about.numbers.rating' | t }}</span><strong>4.9★</strong></div>
      </div>

      <div class="container" appReveal="zoom">
        <div class="about__cta">
          <h2>{{ 'about.cta.title.a' | t }}<em>{{ 'about.cta.title.em' | t }}</em>{{ 'about.cta.title.b' | t }}</h2>
          <a routerLink="/shop"><app-button variant="accent" size="lg">{{ 'about.cta.btn' | t }}</app-button></a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about { padding: clamp(4rem, 8vw, 7rem) 0 5rem; }

    .about__hero { max-width: 880px; margin: 0 auto 4rem; }
    .eyebrow {
      display: inline-block;
      font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
      color: var(--color-text-muted); font-weight: 500; margin: 0 0 1.4rem;
    }
    .about h1 {
      font-family: var(--font-display); font-weight: 400;
      font-size: clamp(2.4rem, 9vw, 6.8rem);
      letter-spacing: -.04em; line-height: .96;
      margin: 0 0 1.6rem;
      animation: fadeUp .8s var(--ease-out-expo);
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
    }
    .about h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .lede {
      color: var(--color-text-soft); font-size: 1.2rem; line-height: 1.6;
      margin: 0; max-width: 60ch;
    }

    .band {
      padding: 1.8rem 0; margin: 3rem 0;
      border-block: 1px solid var(--color-border);
      background: var(--color-surface);
      overflow: hidden;
    }
    .band .marquee {
      gap: 2.5rem;
      font-family: var(--font-display); font-weight: 400;
      font-size: clamp(1.6rem, 3.5vw, 2.6rem);
      letter-spacing: -.025em; color: var(--color-text);
      font-variation-settings: 'opsz' 144, 'SOFT' 60, 'WONK' 0;
    }
    .band .marquee em { color: var(--color-accent); font-style: italic; }
    .band .marquee span:nth-child(even) { color: var(--color-text-dim); font-family: var(--font-mono); font-size: 1rem; vertical-align: middle; }

    /* Principles — numbered list, no card grid */
    .about__principles {
      display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 3rem;
      margin: 4rem auto;
    }
    .principle {
      padding: 1.4rem 0;
      border-top: 1px solid var(--color-border);
    }
    .principle__num {
      display: inline-block;
      font-family: var(--font-mono); font-size: .82rem; letter-spacing: .08em;
      color: var(--color-accent); margin-bottom: 1rem; font-weight: 500;
    }
    .principle h3 {
      font-family: var(--font-display); font-weight: 400;
      margin: 0 0 .8rem; font-size: clamp(1.4rem, 2.6vw, 1.9rem); letter-spacing: -.025em;
    }
    .principle p { color: var(--color-text-soft); margin: 0; line-height: 1.65; max-width: 50ch; }

    /* Numbers — plain row */
    .about__numbers {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;
      padding: 3rem 0; margin: 2rem 0;
      border-block: 1px solid var(--color-border);
    }
    .about__numbers div { display: flex; flex-direction: column; gap: .35rem; }
    .num__label { font-family: var(--font-mono); font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-muted); }
    .about__numbers strong {
      font-family: var(--font-display); font-weight: 400;
      font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -.035em; line-height: 1;
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
    }

    /* Bottom CTA */
    .about__cta {
      padding: clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem); margin-top: 4rem;
      background: var(--color-text); color: var(--color-bg);
      border-radius: var(--radius-2xl);
      display: flex; flex-direction: column; align-items: flex-start; gap: 1.6rem;
    }
    .about__cta h2 {
      font-family: var(--font-display); font-weight: 400; margin: 0;
      font-size: clamp(2rem, 5vw, 3.4rem); letter-spacing: -.04em; line-height: 1;
      max-width: 18ch;
    }
    .about__cta h2 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }

    @media (max-width: 880px) {
      .about__principles { grid-template-columns: 1fr; gap: 0; }
      .about__numbers { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 540px) {
      .about__numbers { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent {}
