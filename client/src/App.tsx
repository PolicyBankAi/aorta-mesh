import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";

import Home from "@/pages/Home";
import CasePassports from "@/pages/case-passports";
import SmartForms from "@/pages/smart-forms";
import QaWorkbench from "@/pages/qa-workbench";
import ChainOfCustody from "@/pages/chain-of-custody";
import AuditBinder from "@/pages/audit-binder";
import Connectors from "@/pages/connectors";
import AdminConsole from "@/pages/admin-console";
import QueueManagement from "@/pages/queue-management";
import FourEyesApproval from "@/pages/four-eyes-approval";
import BulkOperations from "@/pages/bulk-operations";

// ✅ RBAC types
import { UserRole } from "@/shared/rbac";

// ✅ ConsentManager lives in components/ui
import { ConsentManager } from "@/components/ui/ConsentManager";

// ✅ Wrapper component to inject userId prop
function ConsentManagerRoute({ userId }: { userId: string }) {
  return <ConsentManager userId={userId} />;
}

// ✅ RBAC helper
function hasRole(userRole: string, allowed: UserRole[]): boolean {
  return allowed.includes(userRole as UserRole);
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const role = user?.role as UserRole | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold">AORTA Mesh™</h1>
          <p className="text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
        </>
      ) : (
        <>
          {/* Common routes for all staff */}
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/case-passports" component={CasePassports} />
          <Route path="/chain-of-custody" component={ChainOfCustody} />

          {/* Role-specific */}
          {role && hasRole(role, [
            UserRole.OPO_COORDINATOR, 
            UserRole.RECOVERY_COORDINATOR, 
            UserRole.TRIAGE_COORDINATOR
          ]) && (
            <>
              <Route path="/smart-forms" component={SmartForms} />
              <Route path="/queue-management" component={QueueManagement} />
            </>
          )}

          {role && hasRole(role, [UserRole.QUALITY_STAFF, UserRole.ADMIN]) && (
            <>
              <Route path="/qa-workbench" component={QaWorkbench} />
              <Route path="/four-eyes-approval" component={FourEyesApproval} />
              <Route path="/audit-binder" component={AuditBinder} />
            </>
          )}

          {role && hasRole(role, [UserRole.LAB_STAFF]) && (
            <Route path="/bulk-operations" component={BulkOperations} />
          )}

          {role && hasRole(role, [UserRole.ADMIN]) && (
            <>
              <Route path="/connectors" component={Connectors} />
              <Route path="/admin-console" component={AdminConsole} />
            </>
          )}

          {/* Consent Manager (Admin/Surgeon only) */}
          {role && hasRole(role, [UserRole.SURGEON, UserRole.ADMIN]) && (
            <Route
              path="/consents"
              component={() => <ConsentManagerRoute userId={user?.id ?? ""} />}
            />
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-black">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
