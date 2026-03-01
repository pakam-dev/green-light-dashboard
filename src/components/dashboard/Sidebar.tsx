import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart2,
  Landmark,
  CreditCard,
  Banknote,
  Wallet,
  HardHat,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const menuItems = [
  // { id: "dashboard",   label: "Dashboard",  icon: LayoutDashboard },
  // { id: "total-users", label: "Total Users", icon: Users },
  { id: "reports",     label: "Dashboard",  icon: BarChart2  },
  { id: "collectors",  label: "Collectors", icon: HardHat   },
  { id: "schedules",   label: "Schedules",  icon: Calendar   },
  { id: "loan",        label: "Loan",       icon: Landmark   },
  { id: "instantbuy",  label: "InstantBuy", icon: CreditCard },
  { id: "financials",  label: "Financials", icon: Banknote  },
  { id: "payouts",     label: "Payouts",    icon: Wallet    },
  
];

export const Sidebar = ({ activeItem, onItemClick, isOpen = false, onClose, onLogout }: SidebarProps) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-50 h-screen w-64 bg-primary transition-transform duration-300",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
          </div>
          <div>
            <span className="text-xl font-bold text-white">Pakam</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col flex-1 px-3 py-4">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    onItemClick(item.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors",
                    activeItem === item.id && "bg-white/20 text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="flex-1 text-left text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
