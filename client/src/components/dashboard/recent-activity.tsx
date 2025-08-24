import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import {
  FileUp,
  AlertTriangle,
  Check,
  Share,
  FilePlus,
} from "lucide-react";

interface Activity {
  id: string;
  type:
    | "document_uploaded"
    | "case_passport_created"
    | "qa_alert_created"
    | "audit_binder_completed"
    | "case_passport_shared";
  message: string;
  caseId?: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

const activityIcons = {
  document_uploaded: FileUp,
  case_passport_created: FilePlus,
  qa_alert_created: AlertTriangle,
  audit_binder_completed: Check,
  case_passport_shared: Share,
} as const;

const activityColors = {
  document_uploaded: "bg-green-500",
  case_passport_created: "bg-blue-500",
  qa_alert_created: "bg-yellow-500",
  audit_binder_completed: "bg-blue-500",
  case_passport_shared: "bg-purple-500",
} as const;

export default function RecentActivity() {
  const { data: activities, isLoading, isError } = useQuery<Activity[]>({
    queryKey: ["/api/activity-logs"],
    queryFn: async () => {
      const response = await fetch("/api/activity-logs?limit=10", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg">
        <CardHeader className="border-b border-cyan-400">
          <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
          <p className="text-sm text-cyan-300">
            Latest updates across all case passports
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 bg-gray-800 mb-2" />
                  <Skeleton className="h-3 w-1/4 bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !activities || activities.length === 0) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg">
        <CardHeader className="border-b border-cyan-400">
          <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-cyan-300">No recent activity found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="bg-black border-cyan-400 shadow rounded-lg h-full"
      data-testid="recent-activity"
    >
      <CardHeader className="border-b border-cyan-400">
        <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
        <p className="text-sm text-cyan-300">
          Latest updates across all case passports
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || FileUp;
            const color = activityColors[activity.type] || "bg-cyan-400";

            return (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 bg-black border border-cyan-400/30 rounded-lg hover:bg-gray-900"
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${color}`}
                >
                  <Icon className="h-4 w-4 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-cyan-300">{activity.message}</div>
                  <div className="text-xs text-cyan-400/70">
                    {activity.user.name} ({activity.user.role}) •{" "}
                    {formatDistanceToNow(new Date(activity.createdAt))} ago
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

