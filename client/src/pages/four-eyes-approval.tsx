import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Shield, UserCheck, Clock, AlertTriangle, CheckCircle, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ✅ Define user type
type AuthUser = {
  id: string;
  email: string;
  role?: string;
};

export default function FourEyesApproval() {
  const { toast } = useToast();
  // ✅ Explicitly type user
  const { isAuthenticated, isLoading, user } = useAuth() as {
    isAuthenticated: boolean;
    isLoading: boolean;
    user?: AuthUser;
  };

  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(async () => {
        const response = await fetch("/api/demo/login", { method: "POST" });
        if (response.ok) {
          window.location.reload();
        }
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const pendingApprovals = [
    {
      id: "approval-001",
      type: "Binder Release",
      caseId: "DN-2024-0892",
      title: "Final Audit Documentation Release",
      requestedBy: "Dr. Sarah Chen",
      requestedAt: "2024-08-17 15:30:00",
      priority: "high",
      description: "Complete audit binder ready for regulatory submission to FDA",
      approvalLevel: "Level 2 - Senior QA Manager",
      requiredApprovers: 2,
      currentApprovals: 0,
      approvers: [
        { name: "Dr. Michael Rodriguez", role: "Senior QA Manager", status: "pending" },
        { name: "Dr. Emily Johnson", role: "Compliance Director", status: "pending" }
      ],
      documents: [
        "FDA_21CFR1271_Compliance_Package.pdf",
        "Donor_Case_Summary_DN-2024-0892.pdf",
        "Chain_of_Custody_Log.pdf"
      ],
      riskLevel: "High",
      impact: "Regulatory compliance and audit readiness"
    },
    {
      id: "approval-002",
      type: "Consent Revocation",
      caseId: "DN-2024-0891",
      title: "Donor Consent Withdrawal Request",
      requestedBy: "Ms. Jennifer Wu",
      requestedAt: "2024-08-17 14:45:00",
      priority: "critical",
      description: "Donor family has requested withdrawal of consent for tissue donation",
      approvalLevel: "Level 3 - Executive Director",
      requiredApprovers: 2,
      currentApprovals: 1,
      approvers: [
        { name: "Dr. Michael Rodriguez", role: "Medical Director", status: "approved" },
        { name: "Ms. Patricia Davis", role: "Executive Director", status: "pending" }
      ],
      documents: [
        "Consent_Withdrawal_Request.pdf",
        "Family_Communication_Log.pdf",
        "Legal_Review_Notes.pdf"
      ],
      riskLevel: "Critical",
      impact: "Legal compliance and ethical obligations"
    },
    {
      id: "approval-003",
      type: "Ledger Amendment",
      caseId: "DN-2024-0890",
      title: "Chain-of-Custody Correction",
      requestedBy: "Dr. Alex Kim",
      requestedAt: "2024-08-17 13:20:00",
      priority: "medium",
      description: "Correction to temperature monitoring log due to sensor calibration error",
      approvalLevel: "Level 1 - QA Supervisor",
      requiredApprovers: 2,
      currentApprovals: 0,
      approvers: [
        { name: "Dr. Sarah Chen", role: "QA Supervisor", status: "pending" },
        { name: "Dr. Michael Rodriguez", role: "Senior QA Manager", status: "pending" }
      ],
      documents: [
        "Temperature_Log_Correction.pdf",
        "Sensor_Calibration_Report.pdf",
        "Technical_Justification.pdf"
      ],
      riskLevel: "Medium",
      impact: "Data integrity and audit trail accuracy"
    }
  ];

  const completedApprovals = [
    {
      id: "approval-004",
      type: "Policy Change",
      title: "Data Retention Policy Update",
      completedAt: "2024-08-17 12:00:00",
      status: "approved",
      approvers: ["Dr. Emily Johnson", "Ms. Patricia Davis"]
    },
    {
      id: "approval-005",
      type: "System Access",
      title: "Emergency Access Grant",
      completedAt: "2024-08-17 10:30:00",
      status: "approved",
      approvers: ["Dr. Michael Rodriguez", "Dr. Sarah Chen"]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const handleApprove = (approvalId: string) => {
    toast({
      title: "Approval Submitted",
      description: "Your approval has been recorded and logged.",
    });
  };

  const handleReject = (approvalId: string) => {
    toast({
      title: "Rejection Submitted",
      description: "Your rejection has been recorded with comments.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">Four-Eyes Approval</h1>
                <p className="text-gray-400">Dual sign-off for critical actions and sensitive operations</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <UserCheck className="h-4 w-4" />
                  {/* ✅ Typed user.email safely */}
                  <span>Logged in as: {user?.email ?? "Unknown User"}</span>
                </div>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Pending Approvals</p>
                      <p className="text-2xl font-bold text-white">{pendingApprovals.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Critical Items</p>
                      <p className="text-2xl font-bold text-red-400">
                        {pendingApprovals.filter(a => a.priority === 'critical').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Awaiting Me</p>
                      <p className="text-2xl font-bold text-blue-400">2</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Completed Today</p>
                      <p className="text-2xl font-bold text-green-400">{completedApprovals.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Pending Approvals */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">Pending Approvals</h2>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <Card key={approval.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-blue-400" />
                          <div>
                            <CardTitle className="text-white text-base">{approval.title}</CardTitle>
                            <p className="text-sm text-gray-400">
                              {approval.type} • Case: {approval.caseId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(approval.priority)}>
                            {approval.priority}
                          </Badge>
                          <span className={`text-sm font-medium ${getRiskColor(approval.riskLevel)}`}>
                            {approval.riskLevel} Risk
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <p className="text-sm text-gray-300 mb-4">{approval.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Requested By</p>
                              <p className="text-sm text-gray-300">{approval.requestedBy}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Requested At</p>
                              <p className="text-sm text-gray-300">{approval.requestedAt}</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">Impact Assessment</p>
                            <p className="text-sm text-gray-300">{approval.impact}</p>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">Supporting Documents</p>
                            <div className="space-y-1">
                              {approval.documents.map((doc, index) => (
                                <div key={index} className="flex items-center text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                                  <FileText className="h-3 w-3 mr-2" />
                                  {doc}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Approval Progress</p>
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300">Required Approvals</span>
                                <span className="text-sm text-white">
                                  {approval.currentApprovals}/{approval.requiredApprovers}
                                </span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(approval.currentApprovals / approval.requiredApprovers) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Approvers</p>
                            <div className="space-y-2">
                              {approval.approvers.map((approver, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-2">
                                  <div>
                                    <p className="text-sm text-gray-300">{approver.name}</p>
                                    <p className="text-xs text-gray-400">{approver.role}</p>
                                  </div>
                                  <div>
                                    {approver.status === 'approved' ? (
                                      <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-yellow-400" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <Button
                              onClick={() => handleApprove(approval.id)}
                              className="w-full bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(approval.id)}
                              variant="outline"
                              className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              size="sm"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-gray-300 border-gray-600"
                              size="sm"
                            >
                              Request More Info
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Recent Completed Approvals */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Recently Completed</h2>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Approvers
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {completedApprovals.map((approval) => (
                          <tr key={approval.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {approval.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {approval.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {approval.completedAt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800">
                                {approval.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {approval.approvers.join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
