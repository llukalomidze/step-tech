import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { AuthState, LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

/**
 * Thrown when the API returns a successful login response but the account
 * needs email verification — the API uses the literal string "Verification"
 * as the access token in that case.
 */
export class EmailVerificationRequiredError extends Error {
  constructor(public readonly email: string) {
    super('Email verification required');
    this.name = 'EmailVerificationRequiredError';
  }
}

const VERIFICATION_SENTINEL = 'Verification';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storageKey = environment.storageKeys.auth;

  private readonly _state = signal<AuthState>(this.read());

  readonly state = this._state.asReadonly();
  readonly token = computed(() => this._state().token);
  readonly isAuthenticated = computed(() => !!this._state().token);
  readonly userEmail = computed(() => this._state().email);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse, LoginRequest>('/api/auth/login', req).pipe(
      tap((res) => {
        const token = res.token ?? res.accessToken ?? res.jwt ?? null;
        if (!token) return;
        if (token === VERIFICATION_SENTINEL) {
          throw new EmailVerificationRequiredError(req.email);
        }
        this.persist({ token, email: req.email });
      }),
      catchError((err) => throwError(() => err))
    );
  }

  register(req: RegisterRequest): Observable<unknown> {
    return this.api.post<unknown, RegisterRequest>('/api/auth/register', req);
  }

  resendVerification(email: string): Observable<unknown> {
    return this.api.post<unknown>(`/api/auth/resend-email-verification/${encodeURIComponent(email)}`);
  }

  verifyEmail(email: string, code: string): Observable<unknown> {
    return this.api.put<unknown, { email: string; code: string }>('/api/auth/verify-email', { email, code });
  }

  logout(): void {
    this.persist({ token: null, email: null });
  }

  private persist(s: AuthState): void {
    this._state.set(s);
    try {
      if (s.token) localStorage.setItem(this.storageKey, JSON.stringify(s));
      else localStorage.removeItem(this.storageKey);
    } catch { /* storage unavailable */ }
  }

  private read(): AuthState {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return { token: null, email: null };
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      const token = parsed.token === VERIFICATION_SENTINEL ? null : parsed.token ?? null;
      return { token, email: parsed.email ?? null };
    } catch {
      return { token: null, email: null };
    }
  }
}
