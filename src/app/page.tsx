"use client";

import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get("code") as string;
    // 重置错误状态
    setError("");
    setLoading(true);
    // 验证是否为空
    if (!code.trim()) {
      setError("请输入邀请码");
      setLoading(false);
      return;
    }

    if (code === "FusionAI@2025") {
      // 设置 is_invited cookie
      Cookies.set("is_invited", "true", { expires: 1 }); // 1天后过期
      router.push("/chat");
      setLoading(false);
    } else {
      setError("邀请码错误，请重新输入");
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/login-bg.png')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
      <motion.img
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        src="/images/fusion-ai.png"
        className="absolute left-8 top-8 h-8"
        alt="FusionAI Logo"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative flex h-screen w-full justify-center"
      >
        <div
          className="mt-[30vh] flex flex-col items-center gap-10"
          style={{
            fontFamily:
              "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl font-medium tracking-wide text-gray-800">
              欢迎使用FusionAI
            </div>
            <div className="text-xl text-gray-600">输入邀请码以继续</div>
          </div>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex w-[320px] gap-3">
              <Input
                type="text"
                placeholder="邀请码"
                className={`w-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                  error ? "border-red-500" : "border-gray-200"
                }`}
                name="code"
                required
                autoComplete="off"
              />
              <Button
                type="submit"
                className="min-w-[80px] bg-[#ec5c29] px-6 hover:bg-[#ec5c29]/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    进入
                  </>
                ) : (
                  "进入"
                )}
              </Button>
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                {error}
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
