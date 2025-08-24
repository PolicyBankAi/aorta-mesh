import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function CasePassports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
            <h1 className="text-2xl font-semibold text-white mb-4">
              Case Passports
            </h1>
            <p className="text-gray-400">
              Unified case records for donors, organs, and tissue lots
            </p>
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400">
                Case Passport management interface coming soon...
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
