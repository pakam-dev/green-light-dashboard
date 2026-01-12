import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { ReusableDataTable, TableColumn, TableTab } from "./ReusableDataTable";
import { toast } from "sonner";

// Types
interface PickupData {
  id: number;
  location: string;
  phone: string;
  createdDate: string;
  pickupDate: string;
}

// Mock data
const mockPickupData: PickupData[] = [
  {
    id: 1,
    location: "cherubmall, Chevron Drive, Oj...",
    phone: "07039093008",
    createdDate: "2026-01-09",
    pickupDate: "Invalid date",
  },
  {
    id: 2,
    location: "Mathew Osawemen Street, Igboe...",
    phone: "09076574427",
    createdDate: "2026-01-09",
    pickupDate: "Invalid date",
  },
  {
    id: 3,
    location: "4th Avenue, Banana Island, Et...",
    phone: "08145351078",
    createdDate: "2026-01-08",
    pickupDate: "Invalid date",
  },
  {
    id: 4,
    location: "Close 44, Victoria Garden Cit...",
    phone: "08109964021",
    createdDate: "2026-01-08",
    pickupDate: "Invalid date",
  },
  {
    id: 5,
    location: "Lekki Phase 1, Lagos...",
    phone: "08023456789",
    createdDate: "2026-01-07",
    pickupDate: "2026-01-10",
  },
  {
    id: 6,
    location: "Victoria Island, Lagos...",
    phone: "08034567890",
    createdDate: "2026-01-07",
    pickupDate: "2026-01-09",
  },
];

const tabs: TableTab[] = [
  { id: "recent-pickups", label: "Recent Pickups" },
  { id: "new-users", label: "New Users" },
  { id: "new-aggregators", label: "New Aggregators" },
];

const columns: TableColumn<PickupData>[] = [
  { key: "location", header: "Pickup Location", className: "font-medium" },
  { key: "phone", header: "Phone" },
  { key: "createdDate", header: "Created Date" },
  { key: "pickupDate", header: "PickUp Date" },
];

export const DataTable = () => {
  const [activeTab, setActiveTab] = useState("recent-pickups");

  // Use the reusable hook
  const tableState = useDataTable({
    data: mockPickupData,
    initialPageSize: 10,
    searchableFields: ["location", "phone"],
  });

  // Export handler
  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.header).join(","),
      ...tableState.filteredData.map(row => 
        columns.map(col => row[col.key as keyof PickupData]).join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  // Filter handler
  const handleFilter = () => {
    toast.info("Filter dialog would open here");
  };

  // Refresh handler
  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Data refreshed!");
  };

  // Row action renderer
  const renderRowActions = (item: PickupData) => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => toast.info(`Viewing details for pickup #${item.id}`)}
    >
      See More
    </Button>
  );

  return (
    <ReusableDataTable
      tableState={tableState}
      columns={columns}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Search pickups..."
      onExport={handleExport}
      onFilter={handleFilter}
      onRefresh={handleRefresh}
      renderRowActions={renderRowActions}
      emptyMessage="No pickups found"
    />
  );
};
