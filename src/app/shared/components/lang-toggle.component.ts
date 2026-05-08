import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button"
            class="lang"
            [attr.aria-label]="'Switch language, currently ' + (t.lang() === 'en' ? 'English' : 'Georgian')"
            (click)="t.toggle()">
      <span [class.is-on]="t.lang() === 'en'">EN</span>
      <span class="lang__sep" aria-hidden="true">/</span>
      <span class="lang__ka" [class.is-on]="t.lang() === 'ka'">ქა</span>
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    .lang {
      display: inline-flex; align-items: center; gap: .35rem;
      height: 2.4rem; padding: 0 .85rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-text-muted);
      cursor: pointer; font-size: .78rem; font-weight: 500;
      font-family: var(--font-mono); letter-spacing: .06em;
      transition: border-color .25s, color .25s, background .25s;
    }
    .lang:hover { border-color: var(--color-text); color: var(--color-text); }
    .lang span { transition: color .25s, font-weight .25s; }
    .lang span.is-on { color: var(--color-text); font-weight: 600; }
    .lang__sep { color: var(--color-text-dim); }
    .lang__ka { font-family: 'MSBlock', 'Sylfaen', 'BPG Nino Mtavruli', var(--font-mono); }
  `]
})
export class LangToggleComponent {
  readonly t = inject(TranslationService);
}
