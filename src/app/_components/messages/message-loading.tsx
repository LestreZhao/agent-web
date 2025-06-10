import styles from "~/app/_components/messages/styles/message-loading.module.css";
import { cn } from "~/core/utils";

export function MessageLoading({ className }: { className?: string }) {
  return (
    <div className={cn(styles.loadingAnimation, className)}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
