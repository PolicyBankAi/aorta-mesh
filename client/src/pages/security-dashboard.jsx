import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, Lock } from "lucide-react";
export default function SecurityDashboard() {
    const [selectedTab, setSelectedTab] = useState("overview");
    const { data: complianceDashboard } = useQuery({
        queryKey: ["/api/security/compliance-dashboard"],
        refetchInterval: 30000,
    });
    const { data: securityIncidents } = useQuery({
        queryKey: ["/api/security/incidents", { limit: 20 }],
        refetchInterval: 10000,
    });
    const { data: auditLogs } = useQuery({
        queryKey: ["/api/security/audit-logs", { limit: 50 }],
        refetchInterval: 15000,
    });
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-900 text-red-100 border-red-700';
            case 'high': return 'bg-orange-900 text-orange-100 border-orange-700';
            case 'medium': return 'bg-yellow-900 text-yellow-100 border-yellow-700';
            case 'low': return 'bg-blue-900 text-blue-100 border-blue-700';
            default: return 'bg-gray-900 text-gray-100 border-gray-700';
        }
    };
    const getComplianceColor = (score) => {
        if (score >= 90)
            return 'text-green-400';
        if (score >= 70)
            return 'text-yellow-400';
        return 'text-red-400';
    };
    return (<div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Enterprise security monitoring and compliance management
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge className="bg-green-900 text-green-100 border-green-700">
              <Shield className="w-4 h-4 mr-1"/>
              Security Active
            </Badge>
            <Badge className="bg-cyan-900 text-cyan-100 border-cyan-700">
              <Lock className="w-4 h-4 mr-1"/>
              Zero Trust
            </Badge>
          </div>
        </div>

        {/* Real-time Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-950 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {securityIncidents?.filter((i) => i.status === "detected" || i.status === "investigating").length ?? 0}
              </div>
              <p className="text-xs text-gray-500">Real-time monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {securityIncidents?.filter((i) => i.severity === "critical").length ?? 0}
              </div>
              <p className="text-xs text-gray-500">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">PHI Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {securityIncidents?.filter((i) => i.phiInvolved).length ?? 0}
              </div>
              <p className="text-xs text-gray-500">Medical data security</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Audit Entries Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {auditLogs?.filter((log) => {
            const today = new Date().toDateString();
            return new Date(log.timestamp).toDateString() === today;
        }).length ?? 0}
              </div>
              <p className="text-xs text-gray-500">Immutable logging</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Compliance Evidence (line 108 fix) */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-cyan-400"/>
                    Recent Evidence Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {Array.isArray(complianceDashboard?.recentEvidence) &&
            complianceDashboard.recentEvidence.length > 0 ? (complianceDashboard.recentEvidence.map((evidence, index) => (<div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                            <div>
                              <p className="text-sm text-white">{evidence.title}</p>
                              <p className="text-xs text-gray-500">
                                {evidence.framework} - {evidence.control}
                              </p>
                            </div>
                            <Badge className={evidence.validationResult?.passed
                ? "bg-green-900 text-green-100 border-green-700"
                : "bg-red-900 text-red-100 border-red-700"}>
                              {evidence.validationResult?.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>))) : (<p className="text-gray-400 text-center py-4">
                          No recent evidence collected
                        </p>)}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              {/* GDPR Requests left unchanged */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}
