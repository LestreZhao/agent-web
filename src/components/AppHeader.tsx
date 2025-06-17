import { motion } from "framer-motion";

export function AppHeader({
  children,
  asChild,
}: {
  children?: React.ReactNode;
  asChild?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4">
      {asChild ? children : <></>}
      <motion.img
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        src="/images/fusion-ai.png"
        alt="FusionAI"
        className="h-[28px] w-auto"
      />
    </div>
  );
}
