import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { nonEmptyTrimmedValidator, strongPasswordValidator } from '../../shared/validators/luhn.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, TranslatePipe],
  template: `
    <section class="auth container">
      <div class="auth__card">
        <h1>{{ 'register.title.a' | t }}<em>{{ 'register.title.em' | t }}</em>{{ 'register.title.b' | t }}</h1>
        <p class="auth__lede">{{ 'register.lede' | t }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="row">
            <label class="field">
              <span>{{ 'common.firstName' | t }}</span>
              <input formControlName="firstName" autocomplete="given-name" />
              @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
                <small class="err">{{ 'register.errFirst' | t }}</small>
              }
            </label>
            <label class="field">
              <span>{{ 'common.lastName' | t }}</span>
              <input formControlName="lastName" autocomplete="family-name" />
              @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
                <small class="err">{{ 'register.errLast' | t }}</small>
              }
            </label>
          </div>

          <label class="field">
            <span>{{ 'common.email' | t }}</span>
            <input formControlName="email" type="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small class="err">{{ 'register.errMail' | t }}</small>
            }
          </label>

          <label class="field">
            <span>{{ 'common.password' | t }}</span>
            <input formControlName="password" type="password" autocomplete="new-password" />
          </label>

          <ul class="rules" aria-live="polite">
            <li [class.is-ok]="rules().minLength">{{ 'register.rules.length' | t }}</li>
            <li [class.is-ok]="rules().upper">{{ 'register.rules.upper' | t }}</li>
            <li [class.is-ok]="rules().digit">{{ 'register.rules.digit' | t }}</li>
            <li [class.is-ok]="rules().special">{{ 'register.rules.special' | t }}</li>
          </ul>

          <app-button type="submit" variant="accent" size="lg" [loading]="submitting()">{{ 'register.btn' | t }}</app-button>
        </form>

        <p class="auth__alt">{{ 'register.haveAccount' | t }} <a routerLink="/login">{{ 'register.signIn' | t }}</a></p>
      </div>
    </section>
  `,
  styles: [`
    .auth { padding: 5rem 0; display: flex; justify-content: center; min-height: 80vh; align-items: center; }
    .auth__card {
      width: 100%; max-width: 480px; padding: 2.6rem;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      animation: fadeUp .6s var(--ease-out-expo);
    }
    .auth h1 { font-family: var(--font-display); font-weight: 400; margin: 0 0 .35rem; font-size: 2.2rem; letter-spacing: -.035em; }
    .auth h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .auth__lede { color: var(--color-text-muted); margin: 0 0 2rem; }
    form { display: flex; flex-direction: column; gap: 1.2rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: .4rem; }
    .field span { font-family: var(--font-mono); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-muted); font-weight: 500; }
    .field input { width: 100%; min-width: 0; padding: .85rem 1rem; border: 1px solid var(--color-border); background: var(--color-bg); border-radius: var(--radius-md); color: var(--color-text); font-family: inherit; font-size: .94rem; outline: none; box-sizing: border-box; transition: border-color .25s, box-shadow .25s; }
    .field input:focus { border-color: var(--color-text); box-shadow: 0 0 0 3px var(--color-accent-soft); }
    .err { color: var(--color-danger); font-size: .82rem; }

    .rules {
      list-style: none; padding: 0; margin: -.4rem 0 0;
      display: grid; grid-template-columns: 1fr 1fr; gap: .25rem .8rem;
      font-family: var(--font-mono); font-size: .72rem;
      color: var(--color-text-muted);
    }
    .rules li { display: flex; align-items: center; gap: .45rem; transition: color .25s; }
    .rules li::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: var(--color-text-dim); transition: background .25s, transform .25s var(--ease-out-quint);
    }
    .rules li.is-ok { color: var(--color-text); }
    .rules li.is-ok::before { background: var(--color-accent); transform: scale(1.3); }

    .auth__alt { text-align: center; color: var(--color-text-muted); font-size: .92rem; margin: 1.6rem 0 0; }
    .auth__alt a { color: var(--color-text); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
    .auth__alt a:hover { color: var(--color-accent); }
    @media (max-width: 480px) { .row, .rules { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]],
    lastName:  ['', [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, strongPasswordValidator()]]
  });

  /** Live-update password rule indicators as the user types. */
  private readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  readonly rules = computed(() => {
    const v = this.password() ?? '';
    return {
      minLength: v.length >= 8,
      upper: /[A-Z]/.test(v),
      digit: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    };
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields.');
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.auth.register(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Account created. Check your email for a verification code.');
          void this.router.navigate(['/verify-email'], { queryParams: { email: value.email } });
        },
        error: () => this.submitting.set(false)
      });
  }
}
