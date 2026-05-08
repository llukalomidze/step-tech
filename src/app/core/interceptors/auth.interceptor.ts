import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Attaches Bearer JWT (when present) and X-API-KEY (when configured) to every request. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const headers: Record<string, string> = {};

  const token = auth.token();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (environment.apiKey) headers['X-API-KEY'] = environment.apiKey;

  return next(Object.keys(headers).length ? req.clone({ setHeaders: headers }) : req);
};
