import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { ReusableDataTable, TableColumn, TableTab } from "./ReusableDataTable";
import { toast } from "sonner";

// Types
interface PickupData {
  id: number;
  location: string;
  quantity: string;
  status: string;
}

// Mock data
const mockPickupData: PickupData[] = [
  {
    id: 1,
    location: "Lekki PEN",
    quantity: "100",
    status: "On Track",
  },
  {
    id: 2,
    location: "Ikoyi",
    quantity: "100",
    status: "At Risk",
  },
  {
    id: 3,
    location: "Lekki",
    quantity: "100",
    status: "Off Track",
  },
];

// const tabs: TableTab[] = [
//   { id: "recent-pickups", label: "Recent Pickups" },
//   { id: "new-users", label: "New Users" },
//   { id: "new-aggregators", label: "New Aggregators" },
// ];

const columns: TableColumn<PickupData>[] = [
  { key: "location", header: "Location", className: "font-medium" },
  { key: "quantity", header: "Quantity" },
  { key: "status", header: "Status",
    render: (item) => {
      let colorClass = "";  
      if (item.status === "On Track") colorClass = "green";
      else if (item.status === "At Risk") colorClass = "yellow";
      else if (item.status === "Off Track") colorClass = "red";
      return <span style={{backgroundColor: colorClass}} className={` py-1 px-2 rounded-full text-white font-medium`}>{item.status}</span>; 
    }
   },
  // { key: "pickupDate", header: "PickUp Date" },
];

export const DataTable = () => {
  const [activeTab, setActiveTab] = useState("recent-pickups");

  // Use the reusable hook
  const tableState = useDataTable({
    data: mockPickupData,
    initialPageSize: 10,
    searchableFields: ["location", "status"],
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
  // const renderRowActions = (item: PickupData) => (
  //   <Button 
  //     variant="outline" 
  //     size="sm"
  //     onClick={() => toast.info(`Viewing details for pickup #${item.id}`)}
  //   >
  //     See More
  //   </Button>
  // );

  return (
    <ReusableDataTable
      tableState={tableState}
      columns={columns}
      descText={'Overall Target Qty: 2000KG'}
      // tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Search pickups..."
      onExport={handleExport}
      onFilter={handleFilter}
      onRefresh={handleRefresh}
      // renderRowActions={renderRowActions}
      emptyMessage="No pickups found"
    />
  );
};
