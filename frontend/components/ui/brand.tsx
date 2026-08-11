import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  showText?: boolean;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Brand({ className, showText = true, showSubtitle = true, size = "md" }: BrandProps) {
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 120, height: 120 },
  };

  const dim = dimensions[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/img/logo/multiturn-title-outlinel.svg"
        alt="MultiTurn AI"
        width={dim.width}
        height={dim.height}
        className="rounded-lg"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">
            MultiTurn <span className="text-[#2563eb] dark:text-[#3b82f6]">AI</span>
          </span>
          {size !== "sm" && showSubtitle && (
            <span className="text-xs text-[#64748b] dark:text-slate-400">
              Chatbot using Llama 3
            </span>
          )}
        </div>
      )}
    </div>
  );
}

