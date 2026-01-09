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

const Index = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeOneSignal();
  }, []);

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
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
        />

        <main className="p-6">
          {/* Stats Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsRow1.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                valueColor={stat.valueColor}
                delay={index * 50}
              />
            ))}
          </div>

          {/* Stats Row 2 */}
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsRow2.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                valueColor={stat.valueColor}
                delay={(index + 4) * 50}
              />
            ))}
          </div>

          {/* Map Section */}
          <div className="mt-6">
            <MapSection />
          </div>

          {/* Data Table */}
          <div className="mt-6">
            <DataTable />
          </div>
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

export default Index;
