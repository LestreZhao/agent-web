import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useMemo } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { useAuthStore } from "~/core/store/auth";
import { useAuth } from "~/hooks/use-auth";

export function UserPanel() {
  const { logout } = useAuth();
  const { userInfo } = useAuthStore();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-start gap-2">
            <Avatar name={userInfo?.name} email={userInfo?.email} />
            <h3 className="cursor-pointer text-sm font-medium hover:text-gray-500">
              {userInfo?.name}
            </h3>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-[280px] rounded-lg
       border bg-white p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Avatar name={userInfo?.name} email={userInfo?.email} />
            <div className="flex flex-col">
              <h3 className="text-sm font-medium">{userInfo?.name}</h3>
              <p className="text-xs text-gray-500">{userInfo?.account}</p>
            </div>
          </div>
          <div className="mt-2 border-t pt-2">
            <motion.div
              transition={{
                duration: 0.2,
              }}
              whileHover={{
                cursor: "pointer",
                scale: 1.01,
              }}
              className="flex w-full cursor-pointer items-center justify-start rounded-md p-2 text-sm text-red-500 hover:bg-[#f3f3f2]"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </motion.div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// 预定义一组好看的背景色
const AVATAR_COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#fbbf24", // amber
  "#a3e635", // lime
  "#34d399", // emerald
  "#2dd4bf", // teal
  "#38bdf8", // sky
  "#818cf8", // indigo
  "#a78bfa", // violet
  "#f472b6", // pink
];

function Avatar({
  name,
  email,
  avatar,
}: {
  name?: string;
  email?: string;
  avatar?: string;
}) {
  // 使用 useMemo 缓存结果，避免重复计算
  const { bgColor, initial } = useMemo(() => {
    // 从名字或邮箱中获取首字母
    let initial = "?";
    if (name) {
      initial = name.charAt(0).toUpperCase();
    } else if (email) {
      initial = email.charAt(0).toUpperCase();
    }

    // 根据字符生成固定的背景色
    const index = initial.charCodeAt(0) % AVATAR_COLORS.length;
    const bgColor = AVATAR_COLORS[index];

    return { bgColor, initial };
  }, [name, email]);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || "用户头像"}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
}
