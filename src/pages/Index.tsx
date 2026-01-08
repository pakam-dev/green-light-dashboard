import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { initializeOneSignal } from "@/lib/onesignal";

const stats = [
  {
    title: "Total Revenue",
    value: "$54,230",
    change: 12.5,
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,340",
    change: 8.2,
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: -2.1,
    icon: TrendingUp,
  },
  {
    title: "Total Orders",
    value: "1,240",
    change: 15.3,
    icon: ShoppingCart,
  },
];

const Index = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  useEffect(() => {
    // Initialize OneSignal on app load
    initializeOneSignal();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header
          onNotificationClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
        />

        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                delay={index * 50}
              />
            ))}
          </div>

          {/* Charts and Activity */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="mt-6">
            <ActivityFeed />
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
