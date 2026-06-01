import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ChangePasswordRequest, EditProfileRequest, User } from '../models/user.model';

/** Profile-management endpoints for the signed-in user. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  /** GET /api/users/me — the current user's profile. */
  me(): Observable<User> {
    return this.api.get<User>('/api/users/me');
  }

  /** PUT /api/users — updates editable profile fields (name, surname, …). */
  updateProfile(req: EditProfileRequest): Observable<unknown> {
    return this.api.put<unknown, EditProfileRequest>('/api/users', req);
  }

  /** PUT /api/users/change-password — swaps the account password. */
  changePassword(req: ChangePasswordRequest): Observable<unknown> {
    return this.api.put<unknown, ChangePasswordRequest>('/api/users/change-password', req);
  }
}
