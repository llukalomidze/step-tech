export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** The shape of the login response is not formally defined in the swagger,
 *  but the API conventionally returns a JWT. We accept multiple possible keys. */
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
}

export interface AuthState {
  token: string | null;
  email: string | null;
}
