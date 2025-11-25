export interface LoginRequest {
  Username: string;
  Password: string;
}

export interface RegisterRequest {
  Username: string;
  Email: string;
  Password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}