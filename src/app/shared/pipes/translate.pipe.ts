import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

/**
 * `{{ 'nav.home' | t }}` — looks up the key in the active dictionary.
 * Impure so it re-runs when the user toggles language without us having to
 * mark every host component dirty manually.
 */
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly trans = inject(TranslationService);
  transform(key: string): string {
    return this.trans.dict()[key] ?? key;
  }
}
