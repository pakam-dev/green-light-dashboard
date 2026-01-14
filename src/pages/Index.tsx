import { Truck, Globe, Building2, Users, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { MapSection } from "@/components/dashboard/MapSection";
import { DataTable } from "@/components/dashboard/DataTable";

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

  return (
        <div>
          {/* Stats Row 1 */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-4">
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
          {/* <div className="mt-6">
            <MapSection />
          </div> */}

          {/* Data Table */}
          <div className="mt-6">
            <DataTable />
          </div>
        </div>

  );
};

export default Index;
