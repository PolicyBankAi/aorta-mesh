import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { AlertTriangle, ClipboardCheck, Search } from "lucide-react";

export default function QaWorkbench() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please sign in again.",
        variant: "destructive",
      });
      setTimeout(async () => {
        // TODO: Switch to production login
        const response = await fetch("/api/login", { method: "POST" });
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
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-white mb-2">QA Workbench</h1>
            <p className="text-gray-400 mb-8">
              Quality assurance tools for discrepancy management, audit alerts, and compliance monitoring.
            </p>

            {/* Placeholder modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-white">Discrepancy Reports</h2>
                <p className="text-sm text-gray-400">Monitor case inconsistencies and flag quality issues.</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                <ClipboardCheck className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-white">Audit Alerts</h2>
                <p className="text-sm text-gray-400">Stay updated on regulatory alerts and compliance checks.</p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                <Search className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-white">Case Reviews</h2>
                <p className="text-sm text-gray-400">Perform detailed QA reviews for donor cases and passports.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
