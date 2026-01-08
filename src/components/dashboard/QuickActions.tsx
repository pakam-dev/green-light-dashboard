import { Plus, Download, Share2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common tasks at your fingertips</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4">
          <Plus className="h-5 w-5 text-primary" />
          <span className="text-sm">New Project</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4">
          <Download className="h-5 w-5 text-primary" />
          <span className="text-sm">Export Data</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4">
          <Share2 className="h-5 w-5 text-primary" />
          <span className="text-sm">Share Report</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4">
          <Settings className="h-5 w-5 text-primary" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
};
