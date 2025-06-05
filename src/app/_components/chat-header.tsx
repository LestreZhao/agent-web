import { motion } from "framer-motion";
import { Ellipsis, FileSearch, Share, Star } from "lucide-react";

import { Button } from "~/components/ui/button";
import { TooltipButton } from "~/components/ui/tooltip-button";

export default function ChatHeader({ header }: { header: string }) {
  return (
    <motion.div className="flex w-full items-center justify-between">
      <motion.span className="line-clamp-1 w-[55%] text-[18px] font-bold text-[#34322D]">
        {header}
      </motion.span>
      {/* <div className="flex items-center gap-4 text-[#535350]">
        <Button variant="outline" className="rounded-full bg-[#f8f8f7] px-2">
          <Share />
          <span className="text-[#34322D]">分享</span>
        </Button>
        <TooltipButton
          tooltip="搜索"
          tooltipSide="top"
          tooltipAlign="center"
          variant="ghost"
          className="p-0"
        >
          <FileSearch />
        </TooltipButton>
        <TooltipButton
          tooltip="收藏"
          tooltipSide="top"
          tooltipAlign="center"
          variant="ghost"
          className="p-0"
        >
          <Star />
        </TooltipButton>
        <TooltipButton
          tooltip="更多"
          tooltipSide="top"
          tooltipAlign="center"
          variant="ghost"
          className="p-0"
        >
          <Ellipsis />
        </TooltipButton>
      </div> */}
    </motion.div>
  );
}
