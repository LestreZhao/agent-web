import { service } from "~/lib/axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export const AuthService = {
  async login(credentials: LoginCredentials) {
    const response = await service.post("/auth/login", credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await service.post("/auth/register", data);
    return response.data;
  },

  async logout() {
    const response = await service.post("/auth/logout");
    return response.data;
  },

  async getCurrentUser() {
    const response = await service.get("/auth/me");
    return response.data;
  },
};
