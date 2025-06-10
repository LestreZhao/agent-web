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
import { cn } from "~/core/utils";
import { useAuth } from "~/hooks/use-auth";

// 邮箱验证正则
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
// 手机号验证正则（中国大陆手机号）
const PHONE_REGEX = /^1[3-9]\d{9}$/;

interface RegisterFormData {
  name: string;
  account: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      account: "",
      password: "",
      confirmPassword: "",
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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const loginType = EMAIL_REGEX.test(data.account) ? "email" : "phone";
      const { success, error } = await registerUser({
        name: data.name,
        type: loginType,
        account: data.account,
        password: data.password,
      });

      if (!success && error) {
        toast.error(error);
      }
    } catch (error) {
      toast.error("注册失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <DotBackground />
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-[480px] rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="mb-4 flex flex-col">
            <motion.span className="pb-2 text-xl font-bold">
              注册一个新账户开始使用
            </motion.span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  昵称
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "请输入您的昵称",
                    minLength: {
                      value: 2,
                      message: "名字至少2个字符",
                    },
                  })}
                  placeholder="请输入您的昵称"
                  disabled={isLoading}
                  aria-invalid={errors.name ? "true" : "false"}
                  className={cn(
                    errors.account ? "border-red-500" : "",
                    "h-11 rounded-xl bg-white p-4",
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                  placeholder="请输入邮箱或手机号"
                  disabled={isLoading}
                  aria-invalid={errors.account ? "true" : "false"}
                  className={cn(
                    errors.account ? "border-red-500" : "",
                    "h-11 rounded-xl bg-white p-4",
                  )}
                />
                {errors.account ? (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.account.message}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    {isEmail
                      ? "✓ 邮箱格式正确"
                      : isPhone
                        ? "✓ 手机号格式正确"
                        : accountValue
                          ? "请输入正确的邮箱或手机号"
                          : "支持邮箱或手机号注册"}
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
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                        message: "密码必须包含大小写字母和数字",
                      },
                    })}
                    placeholder="请输入密码"
                    disabled={isLoading}
                    aria-invalid={errors.password ? "true" : "false"}
                    className={cn(
                      errors.password ? "border-red-500" : "",
                      "h-11 rounded-xl bg-white p-4",
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  确认密码
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "请确认密码",
                      validate: (value) =>
                        value === watch("password") || "两次输入的密码不一致",
                    })}
                    placeholder="请再次输入密码"
                    disabled={isLoading}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    className={cn(
                      errors.confirmPassword ? "border-red-500" : "",
                      "h-11 rounded-xl bg-white p-4",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    注册中...
                  </div>
                ) : (
                  "注册"
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                已有账户？{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-gray-500 hover:underline"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
