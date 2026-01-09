import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  valueColor?: "default" | "green" | "red" | "gray";
  delay?: number;
}

export const StatCard = ({ title, value, icon: Icon, valueColor = "default", delay = 0 }: StatCardProps) => {
  const colorClasses = {
    default: "text-foreground",
    green: "text-primary",
    red: "text-destructive",
    gray: "text-muted-foreground",
  };

  return (
    <div
      className="bg-card rounded-xl border border-border p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className={cn("text-3xl font-bold", colorClasses[valueColor])}>
        {value}
      </p>
    </div>
  );
};
