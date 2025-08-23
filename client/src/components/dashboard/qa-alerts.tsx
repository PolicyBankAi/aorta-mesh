import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const severityColors = {
  critical: "bg-red-900 text-red-200",
  warning: "bg-yellow-900 text-yellow-200",
  info: "bg-blue-900 text-blue-200",
};

export default function QaAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/qa-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/qa-alerts', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch QA alerts');
      const data = await response.json();
      // Return only the first 5 alerts for the dashboard
      return (data || []).slice(0, 5);
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg" data-testid="qa-alerts-loading">
        <CardHeader className="border-b border-cyan-400">
          <CardTitle className="text-cyan-400">QA Alerts</CardTitle>
          <p className="text-sm text-cyan-300">Critical issues requiring attention</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                  <Skeleton className="h-3 w-1/2 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-cyan-400 shadow rounded-lg h-full" data-testid="qa-workbench">
      <CardHeader className="border-b border-cyan-400">
        <CardTitle className="text-cyan-400">QA Workbench</CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-cyan-300">Flagged Discrepancies</p>
          <span className="text-xs text-cyan-300">Case #12340</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Flagged Discrepancies List */}
        <div className="p-4 border-b border-cyan-400">
          <ul className="space-y-2">
            <li className="flex items-center space-x-3 p-2 bg-black border border-cyan-400/30 rounded hover:bg-gray-900 cursor-pointer">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm text-cyan-300">Missing Signature in Recovery Form</span>
            </li>
            <li className="flex items-center space-x-3 p-2 bg-black border border-cyan-400/30 rounded hover:bg-gray-900 cursor-pointer">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-cyan-300">Temperature Deviation in Chain-of-Custody</span>
            </li>
            <li className="flex items-center space-x-3 p-2 bg-black border border-cyan-400/30 rounded hover:bg-gray-900 cursor-pointer">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-sm text-cyan-300">Incomplete Medical History in Donor Queue</span>
            </li>
          </ul>
        </div>
        
        {/* Document Preview */}
        <div className="p-4">
          <div className="bg-gray-700 rounded-lg p-4 min-h-40">
            <div className="bg-white rounded p-4 h-32 relative">
              <div className="text-black text-xs space-y-2">
                <div className="border-b border-gray-300 pb-2">
                  <h4 className="font-semibold">Recovery Form</h4>
                </div>
                <div className="space-y-1">
                  <p>Signature of Procurement Surgeon: <span className="inline-block w-24 h-4 border border-red-400 bg-red-50 rounded" /></p>
                  <p>Date: April 21, 2024</p>
                  <p>Time: 14:30 EST</p>
                </div>
                <div className="absolute top-16 right-8 w-16 h-8 border-2 border-red-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700">
              Grant Access
            </Button>
            <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700">
              Revoke Access
            </Button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex space-x-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Approve
            </Button>
            <Button size="sm" variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
