import { FC, ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: ReactNode;
  iconBgColor: string;
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor,
}) => {
  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isUp ? 'text-secondary' : 'text-destructive'}`}>
            {trend.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        {subtitle && <p className="text-xs mt-1 text-muted-foreground/80">{subtitle}</p>}
      </div>
    </div>
  );
};
