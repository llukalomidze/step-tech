import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, TranslatePipe],
  template: `
    <section class="auth container">
      <div class="auth__card">
        <p class="eyebrow">{{ 'verify.eyebrow' | t }}</p>
        <h1>{{ 'verify.title.a' | t }}<em>{{ 'verify.title.em' | t }}</em>{{ 'verify.title.b' | t }}</h1>
        <p class="auth__lede">
          {{ 'verify.lede.a' | t }}<span class="email">{{ email() || ('verify.ledeFallback' | t) }}</span>{{ 'verify.lede.b' | t }}
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (!email()) {
            <label class="field">
              <span>{{ 'common.email' | t }}</span>
              <input formControlName="email" type="email" autocomplete="email" placeholder="you@example.com" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <small class="err">{{ 'verify.errMail' | t }}</small>
              }
            </label>
          }

          <label class="field">
            <span>{{ 'verify.code' | t }}</span>
            <input
              formControlName="code"
              type="text"
              inputmode="text"
              autocomplete="one-time-code"
              spellcheck="false"
              autofocus
              class="code-input"
              [placeholder]="'verify.codePlaceholder' | t" />
            @if (form.controls.code.touched && form.controls.code.invalid) {
              <small class="err">{{ 'verify.errCode' | t }}</small>
            }
          </label>

          <app-button type="submit" variant="accent" size="lg" [loading]="submitting()">{{ 'verify.btn' | t }}</app-button>
        </form>

        <div class="resend">
          <span>{{ 'verify.didntGet' | t }}</span>
          @if (cooldown() > 0) {
            <span class="resend__timer">{{ 'verify.resendIn.a' | t }}{{ cooldown() }}{{ 'verify.resendIn.b' | t }}</span>
          } @else {
            <button type="button" class="resend__btn" (click)="resend()" [disabled]="resending() || !email()">
              {{ resending() ? ('verify.resending' | t) : ('verify.resend' | t) }}
            </button>
          }
        </div>

        <p class="auth__alt">{{ 'verify.wrongAccount' | t }} <a routerLink="/register">{{ 'verify.startOver' | t }}</a></p>
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
    .eyebrow {
      display: inline-block;
      font-family: var(--font-mono); font-size: .68rem; letter-spacing: .18em; text-transform: uppercase;
      color: var(--color-text-muted); font-weight: 500; margin: 0 0 1rem;
    }
    .auth h1 { font-family: var(--font-display); font-weight: 400; margin: 0 0 .55rem; font-size: 2.2rem; letter-spacing: -.035em; }
    .auth h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .auth__lede { color: var(--color-text-muted); margin: 0 0 2rem; line-height: 1.55; }
    .email { font-family: var(--font-mono); font-size: .9em; color: var(--color-text); }

    form { display: flex; flex-direction: column; gap: 1.2rem; }
    .field { display: flex; flex-direction: column; gap: .4rem; }
    .field span { font-family: var(--font-mono); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-muted); font-weight: 500; }
    .field input {
      width: 100%; min-width: 0; padding: .85rem 1rem;
      border: 1px solid var(--color-border); background: var(--color-bg);
      border-radius: var(--radius-md); color: var(--color-text);
      font-family: inherit; font-size: .94rem; outline: none; box-sizing: border-box;
      transition: border-color .25s, box-shadow .25s;
    }
    .field input:focus { border-color: var(--color-text); box-shadow: 0 0 0 3px var(--color-accent-soft); }
    .code-input {
      font-family: var(--font-mono);
      font-size: 1.05rem;
      letter-spacing: .12em;
      text-align: center;
    }
    .err { color: var(--color-danger); font-size: .82rem; }

    .resend {
      margin: 1.6rem 0 0;
      display: flex; align-items: center; justify-content: center; gap: .55rem;
      font-family: var(--font-mono); font-size: .76rem; letter-spacing: .08em; text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .resend__timer { color: var(--color-text-dim); }
    .resend__btn {
      background: transparent; border: 0; padding: 0;
      color: var(--color-text); font: inherit; letter-spacing: inherit; text-transform: inherit;
      cursor: pointer; text-decoration: underline; text-underline-offset: 4px;
    }
    .resend__btn:hover { color: var(--color-accent); }
    .resend__btn:disabled { opacity: .5; cursor: progress; }

    .auth__alt { text-align: center; color: var(--color-text-muted); font-size: .92rem; margin: 1.6rem 0 0; }
    .auth__alt a { color: var(--color-text); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
    .auth__alt a:hover { color: var(--color-accent); }
  `]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly resending = signal(false);
  /** Cooldown in seconds before resend is available again. */
  readonly cooldown = signal(0);
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  readonly form = this.fb.nonNullable.group({
    email: [this.route.snapshot.queryParamMap.get('email') ?? '', [Validators.required, Validators.email]],
    code:  ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly email = computed(() => this.form.controls.email.value);

  ngOnInit(): void {
    /** If we know the email already, kick off the cooldown so the user can't
     *  hammer the resend button in the first 30 seconds after registering. */
    if (this.email()) this.startCooldown(30);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, code } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.verifyEmail(email, code.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Email verified. Welcome aboard.');
          void this.router.navigate(['/login'], { queryParams: { email } });
        },
        error: () => this.submitting.set(false)
      });
  }

  resend(): void {
    const email = this.email(); if (!email) return;
    this.resending.set(true);
    this.auth.resendVerification(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resending.set(false);
          this.toast.success('Verification email sent again.');
          this.startCooldown(30);
        },
        error: () => this.resending.set(false)
      });
  }

  private startCooldown(seconds: number): void {
    this.cooldown.set(seconds);
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      this.cooldown.update((s) => {
        if (s <= 1 && this.cooldownInterval) { clearInterval(this.cooldownInterval); this.cooldownInterval = null; return 0; }
        return s - 1;
      });
    }, 1000);
  }
}
