import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  Shield,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react";
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
  const { isAuthenticated, isLoading, user } = useAuth() as {
    isAuthenticated: boolean;
    isLoading: boolean;
    user?: AuthUser;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login"; // ✅ redirect to real login
      }, 500);
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
      requestedAt: "2024-08-17T15:30:00Z",
      priority: "high",
      description:
        "Complete audit binder ready for regulatory submission to FDA",
      approvalLevel: "Level 2 - Senior QA Manager",
      requiredApprovers: 2,
      currentApprovals: 0,
      approvers: [
        { name: "Dr. Michael Rodriguez", role: "Senior QA Manager", status: "pending" },
        { name: "Dr. Emily Johnson", role: "Compliance Director", status: "pending" },
      ],
      documents: [
        "FDA_21CFR1271_Compliance_Package.pdf",
        "Donor_Case_Summary_DN-2024-0892.pdf",
        "Chain_of_Custody_Log.pdf",
      ],
      riskLevel: "High",
      impact: "Regulatory compliance and audit readiness",
    },
    {
      id: "approval-002",
      type: "Consent Revocation",
      caseId: "DN-2024-0891",
      title: "Donor Consent Withdrawal Request",
      requestedBy: "Ms. Jennifer Wu",
      requestedAt: "2024-08-17T14:45:00Z",
      priority: "critical",
      description:
        "Donor family has requested withdrawal of consent for tissue donation",
      approvalLevel: "Level 3 - Executive Director",
      requiredApprovers: 2,
      currentApprovals: 1,
      approvers: [
        { name: "Dr. Michael Rodriguez", role: "Medical Director", status: "approved" },
        { name: "Ms. Patricia Davis", role: "Executive Director", status: "pending" },
      ],
      documents: [
        "Consent_Withdrawal_Request.pdf",
        "Family_Communication_Log.pdf",
        "Legal_Review_Notes.pdf",
      ],
      riskLevel: "Critical",
      impact: "Legal compliance and ethical obligations",
    },
  ];

  const completedApprovals = [
    {
      id: "approval-004",
      type: "Policy Change",
      title: "Data Retention Policy Update",
      completedAt: "2024-08-17T12:00:00Z",
      status: "approved",
      approvers: ["Dr. Emily Johnson", "Ms. Patricia Davis"],
    },
    {
      id: "approval-005",
      type: "System Access",
      title: "Emergency Access Grant",
      completedAt: "2024-08-17T10:30:00Z",
      status: "approved",
      approvers: ["Dr. Michael Rodriguez", "Dr. Sarah Chen"],
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical":
        return "text-red-400";
      case "High":
        return "text-orange-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  // ✅ dynamic "Awaiting Me" count
  const awaitingMe = pendingApprovals.filter((a) =>
    a.approvers.some(
      (ap) =>
        ap.name.toLowerCase().includes(user?.email?.split("@")[0].toLowerCase() ?? "") &&
        ap.status === "pending"
    )
  ).length;

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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  Four-Eyes Approval
                </h1>
                <p className="text-gray-400">
                  Dual sign-off for critical actions and sensitive operations
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <UserCheck className="h-4 w-4" />
                <span>Logged in as: {user?.email ?? "Unknown User"}</span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                label="Pending Approvals"
                value={pendingApprovals.length}
                icon={<Clock className="h-8 w-8 text-yellow-400" />}
              />
              <SummaryCard
                label="Critical Items"
                value={pendingApprovals.filter((a) => a.priority === "critical").length}
                icon={<AlertTriangle className="h-8 w-8 text-red-400" />}
              />
              <SummaryCard
                label="Awaiting Me"
                value={awaitingMe}
                icon={<Eye className="h-8 w-8 text-blue-400" />}
              />
              <SummaryCard
                label="Completed Today"
                value={completedApprovals.length}
                icon={<CheckCircle className="h-8 w-8 text-green-400" />}
              />
            </div>

            {/* Pending Approvals */}
            {/* ... keep your pending approvals UI unchanged ... */}

            {/* Recently Completed */}
            {/* ... keep your completed approvals UI unchanged ... */}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ✅ Extracted reusable card */
function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
