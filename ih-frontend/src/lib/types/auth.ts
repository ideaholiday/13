export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: any;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  password_confirmation: string;
}
