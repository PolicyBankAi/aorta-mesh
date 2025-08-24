import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/shared/rbac";
import { toast } from "@/components/ui/use-toast";

export default function QuickActions() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const handleCreateCase = () => {
    toast({
      title: "New Case Passport",
      description: "Redirecting to case creation workflow…",
    });
    // TODO: navigate("/case-passports/new")
  };

  const handleUploadDocuments = () => {
    toast({
      title: "Upload Documents",
      description: "Opening secure uploader…",
    });
    // TODO: open ObjectUploader modal with caseId
  };

  const handleGenerateReport = () => {
    toast({
      title: "Audit Report",
      description: "Generating secure audit binder export…",
    });
    // TODO: call /api/audit-binder/generate
  };

  return (
    <Card
      className="bg-black border-cyan-400 shadow rounded-lg"
      data-testid="quick-actions"
    >
      <CardHeader className="border-b border-cyan-400">
        <CardTitle className="text-cyan-400">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* ✅ Case creation: only OPO & Recovery Coordinators, Admin */}
          {[UserRole.OPO_COORDINATOR, UserRole.RECOVERY_COORDINATOR, UserRole.ADMIN].includes(
            role!
          ) && (
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-black justify-start border border-cyan-400"
              onClick={handleCreateCase}
              data-testid="button-create-case-passport"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Case Passport
            </Button>
          )}

          {/* ✅ Upload docs: Lab Staff, OPO, Recovery, Admin */}
          {[UserRole.LAB_STAFF, UserRole.OPO_COORDINATOR, UserRole.RECOVERY_COORDINATOR, UserRole.ADMIN].includes(
            role!
          ) && (
            <Button
              variant="secondary"
              className="w-full bg-black hover:bg-gray-900 text-cyan-300 border-cyan-400 justify-start"
              onClick={handleUploadDocuments}
              data-testid="button-upload-documents"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          )}

          {/* ✅ Generate audit report: Quality Staff & Admin only */}
          {[UserRole.QUALITY_STAFF, UserRole.ADMIN].includes(role!) && (
            <Button
              variant="secondary"
              className="w-full bg-black hover:bg-gray-900 text-cyan-300 border-cyan-400 justify-start"
              onClick={handleGenerateReport}
              data-testid="button-generate-audit-report"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Audit Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
