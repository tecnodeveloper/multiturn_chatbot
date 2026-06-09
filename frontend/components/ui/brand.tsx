import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Brand({ className, showText = true, size = "md" }: BrandProps) {
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 120, height: 120 },
  };

  const dim = dimensions[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/img/imageLogo.png"
        alt="MultiTurn AI"
        width={dim.width}
        height={dim.height}
        className="rounded-lg"
        priority
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">MultiTurn AI</span>
          <span className="text-xs text-muted-foreground">
            Chatbot using Llama 3
          </span>
        </div>
      )}
    </div>
  );
}
