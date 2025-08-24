import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Clock, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function QueueManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedQueue, setSelectedQueue] = useState("qa");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please sign in again.",
        variant: "destructive",
      });
      setTimeout(async () => {
        // ✅ Use production login endpoint
        const response = await fetch("/api/login", { method: "POST", credentials: "include" });
        if (response.ok) {
          window.location.reload();
        }
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  const queues = [
    { id: "qa", name: "QA Review Queue", count: 23, priority: "high", sla: "4 hours", escalated: 3, color: "bg-red-600" },
    { id: "intake", name: "Intake Processing", count: 15, priority: "medium", sla: "8 hours", escalated: 1, color: "bg-yellow-600" },
    { id: "audit", name: "Audit Review", count: 8, priority: "low", sla: "24 hours", escalated: 0, color: "bg-blue-600" },
    { id: "approval", name: "Four-Eyes Approval", count: 12, priority: "high", sla: "2 hours", escalated: 2, color: "bg-purple-600" },
  ];

  const queueItems = [
    { id: "DN-2024-0892", title: "Donor Case DN-2024-0892", type: "QA Review", priority: "high", assignee: "Dr. Sarah Chen", created: "2024-08-17 14:30:00", slaRemaining: "2h 15m", status: "escalated", description: "Temperature excursion detected during transport" },
    { id: "DN-2024-0891", title: "Tissue Processing DN-2024-0891", type: "QA Review", priority: "medium", assignee: "Dr. Michael Rodriguez", created: "2024-08-17 13:45:00", slaRemaining: "3h 45m", status: "in_progress", description: "Serology results validation required" },
    { id: "DN-2024-0890", title: "Binder Release DN-2024-0890", type: "Four-Eyes Approval", priority: "high", assignee: "Dr. Emily Johnson", created: "2024-08-17 15:00:00", slaRemaining: "1h 30m", status: "pending_approval", description: "Final audit documentation ready for release" },
    { id: "DN-2024-0889", title: "Intake Validation DN-2024-0889", type: "Intake Processing", priority: "low", assignee: "Ms. Jennifer Wu", created: "2024-08-17 12:00:00", slaRemaining: "6h 20m", status: "assigned", description: "New donor intake documentation review" },
  ];

  const filteredItems = queueItems.filter(item =>
    item.type.toLowerCase().includes(selectedQueue)
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "escalated": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending_approval": return "bg-purple-100 text-purple-800";
      case "assigned": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">Queue Management</h1>
                <p className="text-gray-400">Work queues with SLAs, aging, and escalation rules</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Bulk Assign
                </Button>
              </div>
            </div>

            {/* Queue Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {queues.map((queue) => (
                <div
                  key={queue.id}
                  className={`bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedQueue === queue.id ? "ring-2 ring-blue-500" : "hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedQueue(queue.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-3 h-3 rounded-full ${queue.color}`} />
                    <span className="text-2xl font-bold text-white">{queue.count}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">{queue.name}</h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>SLA:</span>
                      <span>{queue.sla}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escalated:</span>
                      <span className={queue.escalated > 0 ? "text-red-400" : "text-gray-400"}>
                        {queue.escalated}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Queue Items Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Queue Items</h2>
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {filteredItems.length} items
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      {["Case/Item", "Type", "Priority", "Assignee", "SLA Remaining", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{item.title}</div>
                            <div className="text-xs text-gray-400">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{item.type}</td>
                        <td className="px-6 py-4">
                          <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{item.assignee}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Clock className={`h-4 w-4 mr-1 ${item.status === "escalated" ? "text-red-400" : "text-gray-400"}`} />
                            <span className={`text-sm ${item.status === "escalated" ? "text-red-400" : "text-gray-300"}`}>
                              {item.slaRemaining}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="text-xs" aria-label={`Assign ${item.title}`}>Assign</Button>
                            <Button size="sm" variant="outline" className="text-xs" aria-label={`View ${item.title}`}>View</Button>
                            <Button size="sm" variant="ghost" className="text-xs" aria-label={`More actions for ${item.title}`}>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Queue Analytics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">SLA Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-300">On Time</span><span className="text-green-400 font-medium">87%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">At Risk</span><span className="text-yellow-400 font-medium">8%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Breached</span><span className="text-red-400 font-medium">5%</span></div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Workload Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-300">QA Team</span><span className="text-blue-400 font-medium">35 items</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Intake Team</span><span className="text-blue-400 font-medium">18 items</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Audit Team</span><span className="text-blue-400 font-medium">12 items</span></div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Escalation Trends</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Today</span><span className="text-red-400 font-medium">6 escalated</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">This Week</span><span className="text-yellow-400 font-medium">23 escalated</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Avg/Day</span><span className="text-gray-400 font-medium">3.2</span></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
