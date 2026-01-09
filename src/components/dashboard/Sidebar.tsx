import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Building2,
  Shield,
  Calendar,
  Truck,
  ChevronDown,
  Recycle,
} from "lucide-react";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "dropoff-locations", label: "Drop-off Locations", icon: MapPin },
  { id: "user-agencies", label: "User Agencies", icon: Building2 },
  { id: "location", label: "Location", icon: MapPin },
  { id: "roles-permission", label: "Roles & Permission", icon: Shield },
  { 
    id: "total-schedule", 
    label: "Total Schedule", 
    icon: Calendar,
    hasSubmenu: true,
    submenu: [
      { id: "pending-schedule", label: "Pending Schedule" },
      { id: "completed-schedule", label: "Completed Schedule" },
    ]
  },
  { id: "total-dropoff", label: "Total Drop-off", icon: Truck },
  { id: "total-users", label: "Total Users", icon: Users },
];

export const Sidebar = ({ activeItem, onItemClick }: SidebarProps) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Pakam</span>
            <p className="text-xs text-white/70">Enabling people, planet, and profit</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleSubmenu(item.id);
                  } else {
                    onItemClick(item.id);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors",
                  activeItem === item.id && "bg-white/20 text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedMenu === item.id && "rotate-180"
                    )} 
                  />
                )}
              </button>
              {item.hasSubmenu && expandedMenu === item.id && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu?.map((subitem) => (
                    <button
                      key={subitem.id}
                      onClick={() => onItemClick(subitem.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors",
                        activeItem === subitem.id && "bg-white/20 text-white"
                      )}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
