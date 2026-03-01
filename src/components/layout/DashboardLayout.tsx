import { useState, useEffect } from "react";
import { Truck, Globe, Building2, Users, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { MapSection } from "@/components/dashboard/MapSection";
import { DataTable } from "@/components/dashboard/DataTable";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { initializeOneSignal } from "@/lib/onesignal";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const statsRow1 = [
  {
    title: "Total Pending Dropoff",
    value: "345",
    icon: Truck,
    valueColor: "gray" as const,
  },
  {
    title: "Total Waste (KG)",
    value: "773,981.504 Kg",
    icon: Globe,
    valueColor: "green" as const,
  },
  {
    title: "Total Organisations",
    value: "340",
    icon: Building2,
    valueColor: "gray" as const,
  },
  {
    title: "Total Users",
    value: "24,428",
    icon: Users,
    valueColor: "green" as const,
  },
];

const statsRow2 = [
  {
    title: "Total Completed Dropoff",
    value: "788",
    icon: Package,
    valueColor: "gray" as const,
  },
  {
    title: "Pending Pickup",
    value: "995",
    icon: Clock,
    valueColor: "red" as const,
  },
  {
    title: "Completed Pickup",
    value: "14,405",
    icon: CheckCircle,
    valueColor: "green" as const,
  },
  {
    title: "Missed Pickup",
    value: "11,455",
    icon: XCircle,
    valueColor: "red" as const,
  },
];

const exisiting_routes = ['schedules', 'loan', 'reports', 'instantbuy', 'financials', 'payouts', 'collectors']

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeItem, setActiveItem] = useState("reports");
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  useEffect(() => {
    initializeOneSignal();
  }, []);

  useEffect(()=>{
    if(exisiting_routes.includes(activeItem)){
      navigate(`/dashboard/${activeItem}`)
    }
  },[activeItem])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        onItemClick={(item) => {
          setActiveItem(item);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
          onLogout={handleLogout}
          userName={user?.name}
        />

        <main className="px-2 md:p-6">
            <Outlet />
        </main>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Notification Panel */}
      <div className="relative">
        <NotificationPanel
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;
