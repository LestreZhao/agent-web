import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  userInfo: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: null,
      isAuthenticated: false,
      login: (userInfo, token) =>
        set({ userInfo, token, isAuthenticated: true }),
      logout: () =>
        set({ userInfo: null, token: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          userInfo: state.userInfo ? { ...state.userInfo, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    },
  ),
);
