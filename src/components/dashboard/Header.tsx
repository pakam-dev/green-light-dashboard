import { Bell, Menu, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export const Header = ({ onMenuClick, onNotificationClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2">
          Available Location
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onNotificationClick}
        >
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white font-semibold text-sm">
            FL
          </div>
          <span className="text-sm font-medium text-primary">Pakam admin</span>
        </div>
      </div>
    </header>
  );
};
