import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Georgian Lari with the ₾ symbol.
 *   1299 → ₾1,299      |   1299.5 → ₾1,299.50
 *   null/undefined/NaN → "—"
 */
@Pipe({ name: 'gel', standalone: true })
export class CurrencyGelPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const fractional = value % 1 !== 0;
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: fractional ? 2 : 0,
      maximumFractionDigits: 2
    });
    return `₾${formatted}`;
  }
}
