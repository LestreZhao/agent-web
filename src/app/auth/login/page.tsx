// src/app/auth/login/page.tsx
"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { DotBackground } from "~/components/ui/dot-background";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/hooks/use-auth";
import { cn } from "~/lib/utils";

interface LoginFormData {
  account: string;
  password: string;
}

// 邮箱验证正则
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
// 手机号验证正则（中国大陆手机号）
const PHONE_REGEX = /^1[3-9]\d{9}$/;

export default function LoginPage() {
  // 登录
  const { login } = useAuth();
  // 是否正在登录
  const [isLoading, setIsLoading] = useState(false);
  // 是否显示密码
  const [showPassword, setShowPassword] = useState(false);
  // 表单
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      account: "",
      password: "",
    },
  });

  // 监听账号输入，用于动态显示输入框提示文本
  const accountValue = watch("account");
  const isEmail = accountValue && EMAIL_REGEX.test(accountValue);
  const isPhone = accountValue && PHONE_REGEX.test(accountValue);

  const validateAccount = (value: string) => {
    if (!value) {
      return "请输入邮箱或手机号";
    }
    if (!EMAIL_REGEX.test(value) && !PHONE_REGEX.test(value)) {
      return "请输入正确的邮箱或手机号";
    }
    return true;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // 根据输入格式判断登录类型
      const loginType = EMAIL_REGEX.test(data.account) ? "email" : "phone";
      const { success, error } = await login({
        type: loginType,
        account: data.account,
        password: data.password,
      });

      if (!success && error) {
        toast.error(error);
      }
    } catch (error) {
      toast.error("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-xl p-6"
    >
      <motion.div className="my-4 text-xl font-bold">登录 FusionAI</motion.div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-1 flex-col space-y-4"
      >
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">
              邮箱 / 手机号
              <span className="ml-1 text-red-500">*</span>
            </Label>
            <Input
              id="account"
              type={isEmail ? "email" : "tel"}
              {...register("account", {
                required: "请输入邮箱或手机号",
                validate: validateAccount,
              })}
              style={{
                outline: "none",
              }}
              placeholder="请输入邮箱或手机号"
              disabled={isLoading}
              aria-invalid={errors.account ? "true" : "false"}
              className={cn(
                errors.account ? "border-red-500" : "border-gray-300",
                "h-11 rounded-xl p-4",
              )}
            />
            {errors.account && (
              <p className="mt-1 text-sm text-red-500">
                {errors.account.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              密码
              <span className="ml-1 text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "请输入密码",
                  minLength: {
                    value: 6,
                    message: "密码至少6个字符",
                  },
                })}
                placeholder="请输入密码"
                disabled={isLoading}
                aria-invalid={errors.password ? "true" : "false"}
                className={cn(
                  errors.password ? "border-red-500" : "border-gray-300",
                  "h-11 rounded-xl p-4",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-500 hover:underline"
                >
                  忘记密码？
                </Link>
              </div> */}
        </div>
        <div className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-orange-400 hover:bg-orange-500"
            disabled={isLoading}
            variant="default"
            onClick={() => {
              console.log("login");
            }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                登录中...
              </div>
            ) : (
              "登录"
            )}
          </Button>
          <p className="text-center text-sm text-gray-600">
            还没有账户？{" "}
            <Link
              href="/auth/register"
              className="font-medium text-gray-500 hover:underline"
            >
              立即注册
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
