import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, TranslatePipe],
  template: `
    <footer class="ftr">
      <div class="ftr__big" appReveal="up">
        <h2 class="ftr__bigtype">
          <span>Step</span>
          <em>Tech</em>
        </h2>
        <p class="ftr__manifesto">{{ 'ftr.manifesto.a' | t }}<em>{{ 'ftr.manifesto.em' | t }}</em>{{ 'ftr.manifesto.b' | t }}</p>
      </div>

      <div class="container ftr__grid" appReveal="up">
        <div class="ftr__col">
          <h4>{{ 'ftr.shop' | t }}</h4>
          <a routerLink="/shop">{{ 'ftr.allProducts' | t }}</a>
          <a routerLink="/shop" [queryParams]="{ sort: 'newest' }">{{ 'ftr.newArrivals' | t }}</a>
          <a routerLink="/shop" [queryParams]="{ sort: 'rating' }">{{ 'ftr.bestSellers' | t }}</a>
          <a routerLink="/shop" [queryParams]="{ category: 1 }">{{ 'ftr.laptops' | t }}</a>
          <a routerLink="/shop" [queryParams]="{ category: 2 }">{{ 'ftr.smartphones' | t }}</a>
        </div>
        <div class="ftr__col">
          <h4>{{ 'ftr.company' | t }}</h4>
          <a routerLink="/about">{{ 'ftr.about' | t }}</a>
          <a routerLink="/contact">{{ 'ftr.contact' | t }}</a>
          <a routerLink="/about">{{ 'ftr.press' | t }}</a>
          <a routerLink="/about">{{ 'ftr.careers' | t }}</a>
        </div>
        <div class="ftr__col">
          <h4>{{ 'ftr.help' | t }}</h4>
          <a routerLink="/contact">{{ 'ftr.faq' | t }}</a>
          <a routerLink="/contact">{{ 'ftr.shipping' | t }}</a>
          <a routerLink="/contact">{{ 'ftr.returns' | t }}</a>
          <a routerLink="/contact">{{ 'ftr.warranty' | t }}</a>
        </div>
        <div class="ftr__col ftr__col--news">
          <h4>{{ 'ftr.newsletter' | t }}</h4>
          <p>{{ 'ftr.newsletterDesc' | t }}</p>
          <form class="ftr__news" (submit)="$event.preventDefault()">
            <input type="email" placeholder="you&#64;example.com" aria-label="Email" />
            <button type="submit" aria-label="Subscribe">→</button>
          </form>
        </div>
      </div>

      <div class="container ftr__bar">
        <span>{{ 'ftr.copyright.a' | t }} {{ year }} {{ 'ftr.copyright.b' | t }}</span>
      </div>
    </footer>
  `,
  styles: [`
    .ftr { background: var(--color-bg); border-top: 1px solid var(--color-border); margin-top: 7rem; }

    .ftr__big {
      padding: 6rem clamp(1rem, 3vw, 2rem) 1rem;
      max-width: 1300px; margin: 0 auto; text-align: left;
    }
    .ftr__bigtype {
      display: flex; align-items: baseline; gap: .15em; flex-wrap: wrap;
      font-family: var(--font-display); font-weight: 400;
      font-size: clamp(3.2rem, 18vw, 14rem);
      line-height: .9; letter-spacing: -.04em; margin: 0;
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
    }
    .ftr__bigtype em {
      font-family: var(--font-display); font-style: italic; color: var(--color-accent);
      font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    }
    .ftr__manifesto {
      color: var(--color-text-muted); font-size: 1.15rem;
      margin: 1.4rem 0 0; max-width: 50ch;
      font-family: var(--font-display); font-weight: 400; letter-spacing: -.01em;
    }
    .ftr__manifesto em { color: var(--color-accent); font-style: italic; }

    .ftr__grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr 1.4fr;
      gap: 2.5rem;
      padding-block: 4rem 2.5rem;
      border-top: 1px solid var(--color-border);
      margin-top: 2rem;
    }
    .ftr__col h4 {
      font-family: var(--font-mono); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase;
      margin: 0 0 1rem; color: var(--color-text-muted); font-weight: 500;
    }
    .ftr__col a {
      display: block; padding: .35rem 0;
      color: var(--color-text); text-decoration: none; font-size: .98rem;
      transition: color .2s, transform .25s var(--ease-out-quint);
    }
    .ftr__col a:hover { color: var(--color-accent); transform: translateX(4px); }
    .ftr__col p { color: var(--color-text-muted); font-size: .92rem; margin: 0 0 1rem; }

    .ftr__news { display: flex; gap: .35rem; align-items: stretch; }
    .ftr__news input {
      flex: 1; min-width: 0;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: .8rem 1rem; border-radius: var(--radius-md);
      outline: none; transition: border-color .25s, box-shadow .25s;
    }
    .ftr__news input:focus { border-color: var(--color-text); box-shadow: 0 0 0 3px var(--color-accent-soft); }
    .ftr__news button {
      border: 0; background: var(--color-text); color: var(--color-bg);
      width: 3rem; border-radius: var(--radius-md);
      font-weight: 500; font-size: 1.2rem; cursor: pointer;
      transition: transform .25s var(--ease-out-quint), background .25s;
    }
    .ftr__news button:hover { transform: translateX(3px); background: var(--color-accent); color: var(--color-surface); }

    .ftr__bar {
      display: flex; justify-content: space-between;
      padding-block: 1.4rem 1.8rem; border-top: 1px solid var(--color-border);
      font-family: var(--font-mono); font-size: .72rem; letter-spacing: .1em;
      text-transform: uppercase; color: var(--color-text-dim);
    }

    @media (max-width: 880px) { .ftr__grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 540px) { .ftr__grid { grid-template-columns: 1fr; } .ftr__bar { flex-direction: column; gap: .5rem; } }
  `]
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
