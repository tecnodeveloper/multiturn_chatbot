import { FC } from "react";

export const AnalyticsHeader: FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Response Analytics</h1>
      <p className="text-sm text-gray-500 mt-1">
        AI chatbot performance and user feedback insights
      </p>
    </div>
  );
};
