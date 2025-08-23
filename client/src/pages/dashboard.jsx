import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import QaAlerts from "@/components/dashboard/qa-alerts";
import CasePassportPreview from "@/components/dashboard/case-passport-preview";
export default function Dashboard() {
    const { toast } = useToast();
    const { isAuthenticated, isLoading } = useAuth();
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(async () => {
                // Auto login with demo account
                const response = await fetch('/api/demo/login', { method: 'POST' });
                if (response.ok) {
                    window.location.reload();
                }
            }, 500);
            return;
        }
    }, [isAuthenticated, isLoading, toast]);
    if (isLoading || !isAuthenticated) {
        return (<div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>);
    }
    return (<div className="flex h-screen overflow-hidden bg-black">
      <Sidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-black">
          <div className="p-6">
            {/* Top Statistics Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatsCards />
            </div>
            
            {/* Main Content Grid - 3 Columns */}
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Left Column - Recent Activity */}
              <div className="col-span-4">
                <RecentActivity />
              </div>
              
              {/* Middle Column - QA Workbench */}
              <div className="col-span-4">
                <QaAlerts />
              </div>
              
              {/* Right Column - Case Passport Preview */}
              <div className="col-span-4">
                <CasePassportPreview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>);
}
