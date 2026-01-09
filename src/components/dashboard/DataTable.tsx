import { useState } from "react";
import { Search, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tabs = ["Recent Pickups", "New Users", "New Aggregators"];

const mockData = [
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
];

export const DataTable = () => {
  const [activeTab, setActiveTab] = useState("Recent Pickups");

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Tabs */}
      <div className="flex items-center gap-6 px-6 pt-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search data table"
            className="w-64 pl-9 bg-muted/30 border-border"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">Export as CSV</Button>
        </div>
      </div>

      {/* Refresh and Pagination Info */}
      <div className="flex items-center justify-between px-6 py-2">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">1 - 100 of 29476</span>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-primary font-medium">Pickup Location</TableHead>
            <TableHead className="text-primary font-medium">Phone</TableHead>
            <TableHead className="text-primary font-medium">Created Date</TableHead>
            <TableHead className="text-primary font-medium">PickUp Date</TableHead>
            <TableHead className="text-primary font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.location}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.createdDate}</TableCell>
              <TableCell>{row.pickupDate}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  See More
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
