import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface QaAlert {
  id: string;
  caseId: string;
  severity: "critical" | "warning" | "info";
  message: string;
  createdAt: string;
  documentPreview?: {
    name: string;
    missingField?: string;
    timestamp?: string;
  };
}

const severityColors: Record<string, string> = {
  critical: "bg-red-900 text-red-200",
  warning: "bg-yellow-900 text-yellow-200",
  info: "bg-blue-900 text-blue-200",
};

export default function QaAlerts() {
  const queryClient = useQueryClient();

  // ✅ Fetch QA alerts
  const { data: alerts, isLoading } = useQuery<QaAlert[]>({
    queryKey: ["/api/qa-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/qa-alerts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch QA alerts");
      return res.json();
    },
  });

  // ✅ Approve/Reject actions
  const mutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) => {
      const res = await fetch(`/api/qa-alerts/${id}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to ${action} alert`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/qa-alerts"]);
      toast({ title: "Success", description: "QA action recorded" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Action failed" });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg">
        <CardHeader className="border-b border-cyan-400">
          <CardTitle className="text-cyan-400">QA Alerts</CardTitle>
          <p className="text-sm text-cyan-300">Critical issues requiring attention</p>
        </CardHeader>
        <CardContent className="p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 mb-3">
              <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-gray-700" />
                <Skeleton className="h-3 w-1/2 bg-gray-700" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg">
        <CardHeader className="border-b border-cyan-400">
          <CardTitle className="text-cyan-400">QA Workbench</CardTitle>
          <p className="text-sm text-cyan-300">No QA alerts at this time 🎉</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-cyan-400 shadow rounded-lg h-full">
      <CardHeader className="border-b border-cyan-400">
        <CardTitle className="text-cyan-400">QA Workbench</CardTitle>
        <p className="text-sm text-cyan-300">Flagged Discrepancies</p>
      </CardHeader>

      <CardContent className="p-0">
        <ul className="divide-y divide-cyan-800">
          {alerts.slice(0, 5).map((alert) => (
            <li key={alert.id} className="p-4 hover:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${severityColors[alert.severity]}`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-xs text-cyan-400">
                  {formatDistanceToNow(new Date(alert.createdAt))} ago
                </span>
              </div>
              <p className="text-sm text-cyan-300">{alert.message}</p>

              {alert.documentPreview && (
                <div className="mt-3 bg-gray-800 p-3 rounded border border-cyan-400/30">
                  <p className="text-xs text-cyan-200">
                    Document: {alert.documentPreview.name}
                  </p>
                  {alert.documentPreview.missingField && (
                    <p className="text-xs text-red-300">
                      Missing: {alert.documentPreview.missingField}
                    </p>
                  )}
                  {alert.documentPreview.timestamp && (
                    <p className="text-xs text-cyan-400">
                      Timestamp: {alert.documentPreview.timestamp}
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => mutation.mutate({ id: alert.id, action: "approve" })}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                  onClick={() => mutation.mutate({ id: alert.id, action: "reject" })}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
