import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { Button } from "~/components/ui/button";

export function ChatSuggestions({
  onSuggestionClick,
}: {
  onSuggestionClick?: (action: string) => void;
}) {
  const suggestions = [
    {
      title: "血糖失控患者预警",
      label: "糖尿病高危人群筛查与干预",
      action: "筛查血糖控制不佳的糖尿病患者，制定个性化管理方案",
    },
    {
      title: "科室排班优化",
      label: "就诊高峰预测与资源配置",
      action: "分析各科室就诊趋势，预测未来就诊量并优化资源配置",
    },
    {
      title: "门诊复查提醒管理",
      label: "门诊患者复查跟踪",
      action:
        "根据门诊患者检验检查数据，找出门诊患者中需要复查但是没有复查的患者，并制定复查提醒计划",
    },
    {
      title: "科室效益分析",
      label: "运营数据洞察与决策支持",
      action: "分析各科室收入、患者量、药品使用等关键运营指标",
    },
  ];

  const handleSuggestionClick = (action: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex w-full flex-wrap justify-center gap-2"
    >
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          className="rounded-full bg-[#37352f0a] text-xs text-[#535350] shadow-none hover:bg-[#37352f0a]"
          onClick={() => handleSuggestionClick(suggestion.action)}
        >
          {suggestion.title}
          <ArrowUp className="h-2 w-2" />
        </Button>
      ))}
    </motion.div>
  );
}
