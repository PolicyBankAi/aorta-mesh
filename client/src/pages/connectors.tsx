import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Connectors() {
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
              Connectors
            </h1>
            <p className="text-gray-400">
              EHR integrations, lab systems, and courier APIs
            </p>

            <div className="mt-8 space-y-6">
              {/* Active Connectors */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Active Connectors
                  </h2>
                  <p className="text-sm text-gray-400">
                    Healthcare system integrations and data flows
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Epic EHR */}
                    <div className="bg-gray-700 rounded-lg p-4 border border-green-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2" />
                          <h3 className="text-sm font-medium text-white">
                            Epic EHR
                          </h3>
                        </div>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        FHIR R4 integration for patient data exchange
                      </p>
                      <p className="text-xs text-gray-500">
                        Last sync: 5 min ago • 234 records
                      </p>
                    </div>

                    {/* UNOS DonorNet */}
                    <div className="bg-gray-700 rounded-lg p-4 border border-green-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2" />
                          <h3 className="text-sm font-medium text-white">
                            UNOS DonorNet
                          </h3>
                        </div>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        Real-time organ allocation and status updates
                      </p>
                      <p className="text-xs text-gray-500">
                        Last sync: 2 min ago • 12 cases
                      </p>
                    </div>

                    {/* LabCorp LIS */}
                    <div className="bg-gray-700 rounded-lg p-4 border border-yellow-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2" />
                          <h3 className="text-sm font-medium text-white">
                            LabCorp LIS
                          </h3>
                        </div>
                        <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                          Syncing
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        Laboratory results and serology data feed
                      </p>
                      <p className="text-xs text-gray-500">
                        Last sync: 15 min ago • 89 results
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Marketplace */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Connector Marketplace
                  </h2>
                  <p className="text-sm text-gray-400">
                    Available integrations for healthcare systems
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Allscripts",
                        tag: "EHR",
                        tagColor: "bg-blue-600 text-blue-100",
                        desc: "Electronic health records system integration",
                      },
                      {
                        name: "Quest Diagnostics",
                        tag: "LIS",
                        tagColor: "bg-green-600 text-green-100",
                        desc: "Laboratory information system connector",
                      },
                      {
                        name: "UPS Healthcare",
                        tag: "Courier",
                        tagColor: "bg-yellow-600 text-yellow-100",
                        desc: "Temperature-controlled logistics tracking",
                      },
                      {
                        name: "Medtronic Hugo",
                        tag: "IoT",
                        tagColor: "bg-purple-600 text-purple-100",
                        desc: "Surgical robotics data integration",
                      },
                    ].map((connector, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-white">
                            {connector.name}
                          </h3>
                          <span
                            className={`text-xs ${connector.tagColor} px-2 py-1 rounded`}
                          >
                            {connector.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                          {connector.desc}
                        </p>
                        <button className="w-full text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                          Install
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Flow Monitoring */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Data Flow Monitoring
                  </h2>
                  <p className="text-sm text-gray-400">
                    Real-time integration performance and health
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Inbound */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">
                        Inbound Data
                      </h3>
                      {[
                        ["Lab Results", "text-green-400", "89/min"],
                        ["Patient Records", "text-blue-400", "23/min"],
                        ["Shipping Updates", "text-yellow-400", "12/min"],
                      ].map(([label, color, value], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-300">{label}</span>
                          <span className={`text-sm ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Outbound */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">
                        Outbound Data
                      </h3>
                      {[
                        ["Case Updates", "text-green-400", "45/min"],
                        ["Status Reports", "text-blue-400", "15/min"],
                        ["Alert Notifications", "text-red-400", "3/min"],
                      ].map(([label, color, value], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-300">{label}</span>
                          <span className={`text-sm ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* System Health */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">
                        System Health
                      </h3>
                      {[
                        ["API Latency", "text-green-400", "145ms"],
                        ["Success Rate", "text-green-400", "99.8%"],
                        ["Failed Requests", "text-red-400", "2"],
                      ].map(([label, color, value], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-300">{label}</span>
                          <span className={`text-sm ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
