import { BarChart2 } from "lucide-react";
import { format } from "date-fns";

import { useReportFilters, REPORT_TABS } from "@/hooks/useReportFilters";
import { ReportFiltersBar } from "@/components/reports/ReportFilters";
import { ExportPdfButton } from "@/components/reports/ExportPdfButton";
import { ShareLinkButton } from "@/components/reports/ShareLinkButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OverviewTab }   from "@/components/reports/tabs/OverviewTab";
import { LocationsTab }  from "@/components/reports/tabs/LocationsTab";
import { UsersTab }      from "@/components/reports/tabs/UsersTab";
import { RevenueTab }    from "@/components/reports/tabs/RevenueTab";
import { TrendsTab }     from "@/components/reports/tabs/TrendsTab";

const ReportsPage = () => {
  const { filters, updateFilters, setActiveTab, getShareToken } = useReportFilters();

  const locationLabel =
    filters.location === "all"
      ? "All Locations"
      : filters.location.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BarChart2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform performance overview</p>
          </div>
        </div>
        {/* Actions — hidden from PDF */}
        <div className="flex items-center gap-2" data-pdf-hide>
          <ExportPdfButton filters={filters} />
          <ShareLinkButton getToken={getShareToken} />
        </div>
      </div>

      {/* Filters — hidden from PDF */}
      <div data-pdf-hide>
        <ReportFiltersBar filters={filters} onUpdate={updateFilters} />
      </div>

      {/* Report content — captured for PDF */}
      <div id="report-content" className="space-y-6">
        {/* Period + location badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {format(filters.from, "MMM d, yyyy")} – {format(filters.to, "MMM d, yyyy")}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {locationLabel}
          </span>
        </div>

        {/* Tabbed report views */}
        <Tabs
          value={filters.activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="h-10 bg-muted/50 border border-border rounded-xl p-1 flex-wrap gap-1" data-pdf-hide>
            {REPORT_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview"  className="mt-0 focus-visible:outline-none">
            <OverviewTab  filters={filters} />
          </TabsContent>
          <TabsContent value="locations" className="mt-0 focus-visible:outline-none">
            <LocationsTab filters={filters} />
          </TabsContent>
          <TabsContent value="users"     className="mt-0 focus-visible:outline-none">
            <UsersTab     filters={filters} />
          </TabsContent>
          <TabsContent value="revenue"   className="mt-0 focus-visible:outline-none">
            <RevenueTab   filters={filters} />
          </TabsContent>
          <TabsContent value="trends"    className="mt-0 focus-visible:outline-none">
            <TrendsTab    filters={filters} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsPage;
