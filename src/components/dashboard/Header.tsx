import { Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onLogout?: () => void;
  userName?: string;
}

export const Header = ({ onMenuClick, onNotificationClick, onLogout, userName = "Pakam admin" }: HeaderProps) => {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onNotificationClick}
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User avatar dropdown */}
        <div className="border-l border-border pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white font-semibold text-sm">
                  {initials}
                </div>
                <span className="text-sm font-medium text-primary hidden sm:block">{userName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2 cursor-pointer" disabled>
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
