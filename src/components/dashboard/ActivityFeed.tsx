import { CheckCircle2, UserPlus, FileText, AlertCircle, Package } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "success",
    icon: CheckCircle2,
    title: "Project milestone completed",
    description: "Q4 objectives have been achieved",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "user",
    icon: UserPlus,
    title: "New team member joined",
    description: "Sarah Parker joined the Design team",
    time: "15 min ago",
  },
  {
    id: 3,
    type: "document",
    icon: FileText,
    title: "Report generated",
    description: "Monthly analytics report is ready",
    time: "1 hour ago",
  },
  {
    id: 4,
    type: "alert",
    icon: AlertCircle,
    title: "System maintenance",
    description: "Scheduled for tomorrow at 2 AM",
    time: "3 hours ago",
  },
  {
    id: 5,
    type: "package",
    icon: Package,
    title: "New feature deployed",
    description: "Push notifications are now live",
    time: "5 hours ago",
  },
];

const iconColors: Record<string, string> = {
  success: "bg-green-100 text-green-600",
  user: "bg-accent text-accent-foreground",
  document: "bg-blue-100 text-blue-600",
  alert: "bg-amber-100 text-amber-600",
  package: "bg-purple-100 text-purple-600",
};

export const ActivityFeed = () => {
  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest updates from your team</p>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconColors[activity.type]}`}
            >
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
