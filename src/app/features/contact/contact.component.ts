import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { nonEmptyTrimmedValidator } from '../../shared/validators/luhn.validator';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RevealDirective, TranslatePipe],
  template: `
    <section class="contact container">
      <div class="contact__head">
        <p class="eyebrow">{{ 'contact.eyebrow' | t }}</p>
        <h1>{{ 'contact.title.a' | t }}<em>{{ 'contact.title.em' | t }}</em>{{ 'contact.title.b' | t }}</h1>
        <p class="contact__sub">{{ 'contact.sub' | t }}</p>
      </div>

      <div class="contact__grid">
        <form [formGroup]="form" (ngSubmit)="submit()" class="contact__form" appReveal="left" novalidate>
          <label class="field">
            <span>{{ 'contact.name' | t }}</span>
            <input formControlName="name" autocomplete="name" />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <small class="err">Please enter your name.</small>
            }
          </label>

          <label class="field">
            <span>{{ 'contact.email' | t }}</span>
            <input formControlName="email" type="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small class="err">Enter a valid email.</small>
            }
          </label>

          <label class="field">
            <span>{{ 'contact.subject' | t }}</span>
            <input formControlName="subject" />
            @if (form.controls.subject.touched && form.controls.subject.invalid) {
              <small class="err">Subject must be at least 3 characters.</small>
            }
          </label>

          <label class="field">
            <span>{{ 'contact.message' | t }}</span>
            <textarea formControlName="message" rows="6"></textarea>
            @if (form.controls.message.touched && form.controls.message.invalid) {
              <small class="err">Message must be at least 20 characters.</small>
            }
          </label>

          <app-button type="submit" variant="accent" size="lg">{{ 'contact.send' | t }}</app-button>
        </form>

        <aside class="contact__info" appReveal="right">
          <h3>{{ 'contact.visit' | t }}</h3>
          <p>{{ 'contact.address.l1' | t }}<br>{{ 'contact.address.l2' | t }}</p>
          <h3>{{ 'contact.emailLabel' | t }}</h3>
          <p>{{ 'contact.emailValue' | t }}</p>
          <h3>{{ 'contact.hours' | t }}</h3>
          <p>{{ 'contact.hours.l1' | t }}<br>{{ 'contact.hours.l2' | t }}</p>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .contact { padding-block: clamp(4rem, 7vw, 6rem) 5rem; }
    .contact__head { margin-bottom: 4rem; max-width: 780px; }
    .eyebrow {
      display: inline-block;
      font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
      color: var(--color-text-muted); font-weight: 500; margin: 0 0 1.4rem;
    }
    .contact h1 {
      font-family: var(--font-display); font-weight: 400;
      margin: 0 0 1rem;
      font-size: clamp(2.2rem, 8vw, 5.6rem); letter-spacing: -.04em; line-height: 1;
      font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 0;
    }
    .contact h1 em { font-style: italic; color: var(--color-accent); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
    .contact__sub { color: var(--color-text-muted); margin: 0; font-size: 1.1rem; }

    .contact__grid { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; }
    .contact__form {
      display: flex; flex-direction: column; gap: 1.2rem;
      padding: 2rem; background: var(--color-surface); border-radius: var(--radius-xl);
    }
    .field { display: flex; flex-direction: column; gap: .4rem; }
    .field span { font-family: var(--font-mono); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-muted); font-weight: 500; }
    .field input, .field textarea { width: 100%; min-width: 0; padding: .85rem 1rem; border: 1px solid var(--color-border); background: var(--color-bg); border-radius: var(--radius-md); color: var(--color-text); font-family: inherit; font-size: .94rem; outline: none; transition: border-color .25s, box-shadow .25s; box-sizing: border-box; }
    .field input:focus, .field textarea:focus { border-color: var(--color-text); box-shadow: 0 0 0 3px var(--color-accent-soft); }
    .field input::placeholder, .field textarea::placeholder { color: var(--color-text-dim); }
    .field textarea { resize: vertical; min-height: 140px; }
    .err { color: var(--color-danger); font-size: .82rem; }

    .contact__info {
      padding: 2rem; background: var(--color-text); color: var(--color-bg); border-radius: var(--radius-xl);
    }
    .contact__info h3 {
      font-family: var(--font-mono); margin: 0 0 .35rem;
      font-size: .68rem; color: var(--color-accent);
      text-transform: uppercase; letter-spacing: .16em; font-weight: 500;
    }
    .contact__info p {
      margin: 0 0 1.6rem;
      font-family: var(--font-display); font-weight: 400; font-size: 1.2rem;
      letter-spacing: -.015em; line-height: 1.4; color: rgba(252, 250, 243, 0.92);
      font-variation-settings: 'opsz' 144, 'SOFT' 50, 'WONK' 0;
    }
    @media (max-width: 880px) { .contact__grid { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(20)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please check the form for errors.');
      return;
    }
    this.toast.success('Message sent. We will reply soon.');
    this.form.reset();
  }
}
