import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { nonEmptyTrimmedValidator, strongPasswordValidator } from '../../shared/validators/luhn.validator';
import { User } from '../../core/models/user.model';

/** Ensures `newPassword` and `confirmPassword` controls match. */
function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmPassword')?.value;
    return a && b && a !== b ? { mismatch: true } : null;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TranslatePipe],
  template: `
    <section class="profile container">
      <header class="profile__head">
        <h1>{{ 'profile.title.a' | t }}<em>{{ 'profile.title.em' | t }}</em>{{ 'profile.title.b' | t }}</h1>
        <p class="profile__lede">{{ 'profile.lede' | t }}</p>
      </header>

      <div class="profile__grid">
        <!-- Name / surname -->
        <div class="card">
          <h2>{{ 'profile.details.title' | t }}</h2>
          <p class="card__hint">{{ auth.userEmail() }}</p>

          <form [formGroup]="detailsForm" (ngSubmit)="saveDetails()" novalidate>
            <div class="row">
              <label class="field">
                <span>{{ 'common.firstName' | t }}</span>
                <input formControlName="firstName" autocomplete="given-name" />
                @if (detailsForm.controls.firstName.touched && detailsForm.controls.firstName.invalid) {
                  <small class="err">{{ 'register.errFirst' | t }}</small>
                }
              </label>
              <label class="field">
                <span>{{ 'common.lastName' | t }}</span>
                <input formControlName="lastName" autocomplete="family-name" />
                @if (detailsForm.controls.lastName.touched && detailsForm.controls.lastName.invalid) {
                  <small class="err">{{ 'register.errLast' | t }}</small>
                }
              </label>
            </div>
            <app-button type="submit" variant="accent" size="lg" [loading]="savingDetails()" [disabled]="loading()">
              {{ 'profile.details.save' | t }}
            </app-button>
          </form>
        </div>

        <!-- Password -->
        <div class="card">
          <h2>{{ 'profile.password.title' | t }}</h2>
          <p class="card__hint">{{ 'profile.password.hint' | t }}</p>

          <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" novalidate>
            <label class="field">
              <span>{{ 'profile.password.current' | t }}</span>
              <input formControlName="currentPassword" type="password" autocomplete="current-password" />
              @if (passwordForm.controls.currentPassword.touched && passwordForm.controls.currentPassword.invalid) {
                <small class="err">{{ 'profile.password.errCurrent' | t }}</small>
              }
            </label>

            <label class="field">
              <span>{{ 'profile.password.new' | t }}</span>
              <input formControlName="newPassword" type="password" autocomplete="new-password" />
            </label>

            <ul class="rules" aria-live="polite">
              <li [class.is-ok]="rules().minLength">{{ 'register.rules.length' | t }}</li>
              <li [class.is-ok]="rules().upper">{{ 'register.rules.upper' | t }}</li>
              <li [class.is-ok]="rules().digit">{{ 'register.rules.digit' | t }}</li>
              <li [class.is-ok]="rules().special">{{ 'register.rules.special' | t }}</li>
            </ul>

            <label class="field">
              <span>{{ 'profile.password.confirm' | t }}</span>
              <input formControlName="confirmPassword" type="password" autocomplete="new-password" />
              @if (passwordForm.controls.confirmPassword.touched && passwordForm.errors?.['mismatch']) {
                <small class="err">{{ 'profile.password.errMatch' | t }}</small>
              }
            </label>

            <app-button type="submit" variant="accent" size="lg" [loading]="savingPassword()">
              {{ 'profile.password.save' | t }}
            </app-button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .profile { padding: 4rem 0 5rem; min-height: 70vh; }
    .profile__head { max-width: 720px; margin: 0 0 2.4rem; animation: fadeUp .6s var(--ease-out-expo); }
    .profile h1 { font-family: var(--font-display); font-weight: 400; margin: 0 0 .35rem; font-size: 2.4rem; letter-spacing: -.035em; }
    .profile h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .profile__lede { color: var(--color-text-muted); margin: 0; }

    .profile__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6rem; align-items: start; }
    .card {
      padding: 2.2rem;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      animation: fadeUp .6s var(--ease-out-expo);
    }
    .card h2 { font-family: var(--font-display); font-weight: 500; margin: 0 0 .25rem; font-size: 1.35rem; letter-spacing: -.02em; }
    .card__hint { color: var(--color-text-muted); margin: 0 0 1.6rem; font-size: .9rem; }

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

    @media (max-width: 880px) { .profile__grid { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .row, .rules { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UserService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly savingDetails = signal(false);
  readonly savingPassword = signal(false);

  /** Cached server profile so a name update doesn't wipe other fields. */
  private profile: User | null = null;

  readonly detailsForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]],
    lastName:  ['', [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]]
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword:     ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator() }
  );

  private readonly newPassword = toSignal(this.passwordForm.controls.newPassword.valueChanges, { initialValue: '' });
  readonly rules = computed(() => {
    const v = this.newPassword() ?? '';
    return {
      minLength: v.length >= 8,
      upper: /[A-Z]/.test(v),
      digit: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    };
  });

  constructor() {
    this.users.me()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.profile = user;
          this.detailsForm.patchValue({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? ''
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  saveDetails(): void {
    if (this.detailsForm.invalid) { this.detailsForm.markAllAsTouched(); return; }
    this.savingDetails.set(true);
    const { firstName, lastName } = this.detailsForm.getRawValue();
    // Preserve other profile fields the API otherwise expects on a full update.
    this.users.updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: this.profile?.email ?? this.auth.userEmail(),
      phoneNumber: this.profile?.details?.phoneNumber ?? null,
      address: this.profile?.details?.address ?? null,
      pictureUrl: this.profile?.details?.pictureUrl ?? null,
      dateOfBirth: this.profile?.details?.dob ?? null
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingDetails.set(false);
          this.toast.success('Profile updated.');
        },
        error: () => this.savingDetails.set(false)
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields.');
      return;
    }
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.users.changePassword({ currentPassword, newPassword })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordForm.reset();
          this.toast.success('Password changed. Please sign in again.');
          this.auth.logout();
          void this.router.navigate(['/login']);
        },
        error: () => this.savingPassword.set(false)
      });
  }
}
