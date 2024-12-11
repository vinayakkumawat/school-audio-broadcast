export interface AuthResponse {
    success: boolean;
    error?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }