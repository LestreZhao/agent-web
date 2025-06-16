import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  type LoginCredentials,
  type RegisterData,
} from "~/core/api/auth";
import { useAuthStore } from "~/core/store/auth";

export function useAuth() {
  const router = useRouter();
  const {
    login,
    logout: logoutStore,
    userInfo,
    isAuthenticated,
  } = useAuthStore();

  const loginFn = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        console.log("credentials", credentials);
        // const { user, token } = await AuthService.login(credentials);
        const user = {
          id: "1",
          name: "FusionAI",
          account: credentials?.account,
          email: credentials?.account,
        };
        const token = nanoid();
        login(user, token);
        router.push("/"); // 登录成功后跳转
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "登录失败",
        };
      }
    },
    [login, router],
  );

  const registerFn = useCallback(
    async (data: RegisterData) => {
      try {
        // const { user, token } = await AuthService.register(data);
        const user = {
          id: "1",
          name: data?.name,
          account: data?.account,
        };
        const token = nanoid();
        login(user, token);
        router.push("/");
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "注册失败",
        };
      }
    },
    [login, router],
  );

  const logoutFn = useCallback(async () => {
    try {
      // await AuthService.logout();
      logoutStore();
      router.push("/auth/login");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "登出失败",
      };
    }
  }, [logoutStore, router]);

  return {
    userInfo,
    isAuthenticated,
    login: loginFn,
    logout: logoutFn,
    register: registerFn,
  };
}
