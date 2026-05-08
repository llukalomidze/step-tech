export interface UserDetails {
  phoneNumber: string | null;
  address: string | null;
  dob: string | null;
  pictureUrl: string | null;
}

export interface User {
  id: number;
  email: string | null;
  role: string | null;
  firstName: string | null;
  lastName: string | null;
  details: UserDetails | null;
}

export interface EditProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  pictureUrl?: string | null;
  dateOfBirth?: string | null;
}
