import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, AlertTriangle, Check, Share } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const activityIcons = {
  document_uploaded: FileUp,
  case_passport_created: FileUp,
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
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activity-logs'],
    queryFn: async () => {
      const response = await fetch('/api/activity-logs?limit=10', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg" data-testid="recent-activity-loading">
        <CardHeader className="border-b border-cyan-400">
          <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
          <p className="text-sm text-cyan-300">Latest updates across all case passports</p>
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

  return (
    <Card className="bg-black border-cyan-400 shadow rounded-lg h-full" data-testid="recent-activity">
      <CardHeader className="border-b border-cyan-400">
        <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
        <p className="text-sm text-cyan-300">Latest updates across all case passports</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-black border border-cyan-400/30 rounded-lg">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm text-cyan-300">Document uploaded to case #12345</div>
                <div className="text-xs text-cyan-400/70">2 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-black border border-cyan-400/30 rounded-lg">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm text-cyan-300">Case passport created for DN-2024-0893</div>
                <div className="text-xs text-cyan-400/70">4 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-black border border-cyan-400/30 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm text-cyan-300">QA alert triggered for missing signature</div>
                <div className="text-xs text-cyan-400/70">6 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-black border border-cyan-400/30 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm text-cyan-300">Chain-of-custody updated</div>
                <div className="text-xs text-cyan-400/70">8 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
