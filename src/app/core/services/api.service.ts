import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Thin typed wrapper around HttpClient. Centralizes the base URL,
 * query-param building, and the API's `{ data, meta }` envelope —
 * every method automatically unwraps `data` so callers see clean DTOs.
 */
interface Envelope<T> { data: T; meta?: unknown; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Observable<T> {
    return this.http
      .get<Envelope<T>>(this.url(path), { params: this.toParams(params) })
      .pipe(map((res) => this.unwrap<T>(res)));
  }

  post<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http
      .post<Envelope<T>>(this.url(path), body ?? {})
      .pipe(map((res) => this.unwrap<T>(res)));
  }

  put<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http
      .put<Envelope<T>>(this.url(path), body ?? {})
      .pipe(map((res) => this.unwrap<T>(res)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<Envelope<T>>(this.url(path))
      .pipe(map((res) => this.unwrap<T>(res)));
  }

  private url(path: string): string {
    return `${this.base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  /** Pull `data` off the envelope. Falls back to the whole body for endpoints
   *  that return no payload (POST/PUT/DELETE on this API often return empty). */
  private unwrap<T>(res: Envelope<T> | T | null): T {
    if (res && typeof res === 'object' && 'data' in (res as object)) {
      return (res as Envelope<T>).data;
    }
    return res as T;
  }

  private toParams(input?: Record<string, string | number | boolean | null | undefined>): HttpParams {
    let params = new HttpParams();
    if (!input) return params;
    for (const [k, v] of Object.entries(input)) {
      if (v === null || v === undefined || v === '') continue;
      params = params.set(k, String(v));
    }
    return params;
  }
}
