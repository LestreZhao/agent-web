import { cn } from "~/core/utils";

import styles from "~/app/_styles/message-loading.module.css";

export function MessageLoading({ className }: { className?: string }) {
  return (
    <div className={cn(styles.loadingAnimation, className)}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
