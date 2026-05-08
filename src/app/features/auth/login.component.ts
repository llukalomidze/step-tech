import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, EmailVerificationRequiredError } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, TranslatePipe],
  template: `
    <section class="auth container">
      <div class="auth__card">
        <h1>{{ 'login.title.a' | t }}<em>{{ 'login.title.em' | t }}</em>{{ 'login.title.b' | t }}</h1>
        <p class="auth__lede">{{ 'login.lede' | t }}</p>

        @if (verificationPending(); as pendingEmail) {
          <div class="notice">
            <strong>{{ 'login.notice.title' | t }}</strong>
            <p>{{ 'login.notice.desc.a' | t }}<span class="notice__email">{{ pendingEmail }}</span>{{ 'login.notice.desc.b' | t }}</p>
            <div class="notice__actions">
              <a class="notice__link" [routerLink]="['/verify-email']" [queryParams]="{ email: pendingEmail }">{{ 'login.notice.enterCode' | t }}</a>
              <button type="button" class="notice__resend" (click)="resend()" [disabled]="resending()">
                {{ resending() ? ('login.notice.resending' | t) : ('login.notice.resend' | t) }}
              </button>
            </div>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="field">
            <span>{{ 'common.email' | t }}</span>
            <input formControlName="email" type="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small class="err">{{ 'login.errMail' | t }}</small>
            }
          </label>
          <label class="field">
            <span>{{ 'common.password' | t }}</span>
            <input formControlName="password" type="password" autocomplete="current-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <small class="err">{{ 'login.errPass' | t }}</small>
            }
          </label>
          <app-button type="submit" variant="accent" size="lg" [loading]="submitting()">{{ 'login.signInBtn' | t }}</app-button>
        </form>

        <p class="auth__alt">{{ 'login.noAccount' | t }} <a routerLink="/register">{{ 'login.createOne' | t }}</a></p>
      </div>
    </section>
  `,
  styles: [`
    .auth { padding: 5rem 0; display: flex; justify-content: center; min-height: 80vh; align-items: center; }
    .auth__card {
      width: 100%; max-width: 460px; padding: 2.6rem;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      animation: fadeUp .6s var(--ease-out-expo);
    }
    .auth h1 { font-family: var(--font-display); font-weight: 400; margin: 0 0 .35rem; font-size: 2.2rem; letter-spacing: -.035em; }
    .auth h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .auth__lede { color: var(--color-text-muted); margin: 0 0 2rem; }
    form { display: flex; flex-direction: column; gap: 1.2rem; }
    .field { display: flex; flex-direction: column; gap: .4rem; }
    .field span { font-family: var(--font-mono); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-muted); font-weight: 500; }
    .field input { width: 100%; min-width: 0; padding: .85rem 1rem; border: 1px solid var(--color-border); background: var(--color-bg); border-radius: var(--radius-md); color: var(--color-text); font-family: inherit; font-size: .94rem; outline: none; box-sizing: border-box; transition: border-color .25s, box-shadow .25s; }
    .field input:focus { border-color: var(--color-text); box-shadow: 0 0 0 3px var(--color-accent-soft); }
    .err { color: var(--color-danger); font-size: .82rem; }
    .auth__alt { text-align: center; color: var(--color-text-muted); font-size: .92rem; margin: 1.6rem 0 0; }
    .auth__alt a { color: var(--color-text); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
    .auth__alt a:hover { color: var(--color-accent); }

    .notice {
      padding: 1rem 1.2rem; margin: 0 0 1.4rem;
      background: var(--color-accent-tint);
      border-radius: var(--radius-md);
    }
    .notice strong { font-family: var(--font-display); font-weight: 500; font-size: 1.05rem; letter-spacing: -.015em; }
    .notice p { margin: .35rem 0 .8rem; color: var(--color-text-soft); font-size: .9rem; line-height: 1.5; }
    .notice__email { font-family: var(--font-mono); font-size: .85rem; color: var(--color-text); }
    .notice__actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .notice__link {
      color: var(--color-text); text-decoration: none;
      font-family: var(--font-mono); font-size: .76rem; letter-spacing: .12em; text-transform: uppercase;
      padding-bottom: 2px; border-bottom: 1px solid var(--color-text);
      transition: color .25s, border-color .25s;
    }
    .notice__link:hover { color: var(--color-accent-strong); border-bottom-color: var(--color-accent-strong); }
    .notice__resend {
      background: transparent; border: 0; padding: 0;
      color: var(--color-text-muted);
      font-family: var(--font-mono); font-size: .76rem; letter-spacing: .12em; text-transform: uppercase;
      cursor: pointer; text-decoration: underline; text-underline-offset: 4px;
    }
    .notice__resend:hover:not(:disabled) { color: var(--color-text); }
    .notice__resend:disabled { opacity: .5; cursor: progress; }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly resending = signal(false);
  /** Holds the email that needs verification, if the last attempt revealed one. */
  readonly verificationPending = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email:    [this.route.snapshot.queryParamMap.get('email') ?? '', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.verificationPending.set(null);
    this.auth.login(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Welcome back.');
          const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
          void this.router.navigateByUrl(redirect);
        },
        error: (err) => {
          this.submitting.set(false);
          if (err instanceof EmailVerificationRequiredError) {
            this.verificationPending.set(err.email);
            this.toast.info('Please verify your email before signing in.');
          }
        }
      });
  }

  resend(): void {
    const email = this.verificationPending(); if (!email) return;
    this.resending.set(true);
    this.auth.resendVerification(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.resending.set(false); this.toast.success('Verification email sent again.'); },
        error: () => this.resending.set(false)
      });
  }
}
