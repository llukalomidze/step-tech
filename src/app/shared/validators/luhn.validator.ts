import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Luhn algorithm — validates that a credit-card number's digits pass the
 * standard checksum used by Visa/Mastercard/etc. Spaces and dashes are stripped.
 */
export function luhnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '').replace(/[\s-]/g, '');
    if (!raw) return null;
    if (!/^\d{12,19}$/.test(raw)) return { luhn: true };

    let sum = 0;
    let alt = false;
    for (let i = raw.length - 1; i >= 0; i--) {
      let n = Number(raw.charAt(i));
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0 ? null : { luhn: true };
  };
}

/** Trimmed-non-empty validator — rejects whitespace-only strings. */
export function nonEmptyTrimmedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '').trim();
    return v.length === 0 ? { trimmed: true } : null;
  };
}

/** Mirrors the API's password policy: 8+ chars, 1 uppercase, 1 digit, 1 special. */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '');
    const errors: Record<string, true> = {};
    if (v.length < 8) errors['minLength8'] = true;
    if (!/[A-Z]/.test(v)) errors['needsUpper'] = true;
    if (!/\d/.test(v)) errors['needsDigit'] = true;
    if (!/[^A-Za-z0-9]/.test(v)) errors['needsSpecial'] = true;
    return Object.keys(errors).length ? errors : null;
  };
}
