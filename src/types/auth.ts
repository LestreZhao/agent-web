export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginRequest {
  type: "email" | "phone";
  account: string;
  password: string;
}

export interface RegisterRequest {
  type: "email" | "phone";
  name: string;
  account: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  data?: {
    token: string;
    user: User;
  };
  message: string;
}
