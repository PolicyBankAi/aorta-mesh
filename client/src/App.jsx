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
// ✅ ConsentManager lives in components/ui
import { ConsentManager } from "@/components/ui/ConsentManager";
// ✅ Wrapper component to inject userId prop
function ConsentManagerRoute({ userId }) {
    return <ConsentManager userId={userId}/>;
}
function Router() {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) {
        return (<div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black"/>
          </div>
          <h1 className="text-2xl font-bold">AORTA Mesh™</h1>
          <p className="text-gray-400 mt-2">Loading...</p>
        </div>
      </div>);
    }
    return (<Switch>
      {!isAuthenticated ? (<>
          <Route path="/" component={Landing}/>
        </>) : (<>
          <Route path="/" component={Home}/>
          <Route path="/dashboard" component={Dashboard}/>
          <Route path="/case-passports" component={CasePassports}/>
          <Route path="/smart-forms" component={SmartForms}/>
          <Route path="/qa-workbench" component={QaWorkbench}/>
          <Route path="/chain-of-custody" component={ChainOfCustody}/>
          <Route path="/queue-management" component={QueueManagement}/>
          <Route path="/four-eyes-approval" component={FourEyesApproval}/>
          <Route path="/bulk-operations" component={BulkOperations}/>
          <Route path="/audit-binder" component={AuditBinder}/>
          <Route path="/connectors" component={Connectors}/>
          <Route path="/admin-console" component={AdminConsole}/>

          {/* ✅ Consent management page with props (fixed typing issue) */}
          <Route path="/consents" component={() => <ConsentManagerRoute userId={user?.id ?? ""}/>}/>
        </>)}
      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-black">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
