import { FC } from "react";
import { Brand } from "@/components/ui/brand";

export const AnalyticsHeader: FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-8 py-6 flex items-center justify-between">
      <Brand size="md" showText={true} showSubtitle={false} />
      <div className="text-right">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Response Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          AI chatbot performance and user feedback insights
        </p>
      </div>
    </div>
  );
};

