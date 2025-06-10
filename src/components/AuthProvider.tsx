// src/core/providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";

import { AuthService } from "~/core/api/auth";
import { useAuthStore } from "~/core/store/auth";

const AuthContext = createContext<{
  isLoading: boolean;
}>({
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!user) {
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            login(userData, userData.token);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [login, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
