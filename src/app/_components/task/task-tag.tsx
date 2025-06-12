import { motion } from "framer-motion";

// 消息任务标签
export function TaskTag({
  task,
  title,
  icon,
  handleClick,
}: {
  task?: any;
  title?: string;
  icon?: React.ReactNode;
  handleClick?: (task: any) => void;
}) {
  return (
    <motion.div className="flex items-center justify-between">
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          handleClick?.(task);
        }}
        className="my-2 flex cursor-pointer items-center overflow-hidden rounded-full border bg-[#37352f0a] px-2.5 py-1.5 hover:border-[#e0e0df] hover:bg-[#e9e9e8]"
      >
        {icon}
        <motion.span className="ml-2 line-clamp-1 text-xs">{title}</motion.span>
      </motion.div>
    </motion.div>
  );
}
