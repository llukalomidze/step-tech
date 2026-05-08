import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) toast.error(friendly(err));
      return throwError(() => err);
    })
  );
};

interface ApiError {
  detail?: string;
  title?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

function friendly(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Network error — check your connection.';
  if (err.status === 401) return 'You need to sign in to continue.';
  if (err.status === 403) return 'You are not allowed to do that.';
  if (err.status === 404) return 'Resource not found.';
  if (err.status >= 500) return 'Server error — please try again shortly.';

  // Surface real validation/business errors from the API
  const body = err.error as ApiError | string | null;
  if (typeof body === 'string' && body) return body;
  if (body && typeof body === 'object') {
    if (body.errors) {
      const fieldList = Object.values(body.errors).flat().filter(Boolean);
      if (fieldList.length) return fieldList[0]!;
    }
    if (body.detail) return body.detail.split('\n')[0]!.replace(/^\s*--\s*/, '').trim() || body.detail;
    if (body.title) return body.title;
    if (body.message) return body.message;
  }
  return `Request failed (${err.status}).`;
}
