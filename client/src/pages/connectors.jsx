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
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>);
    }
    return (<div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-white mb-4">Connectors</h1>
            <p className="text-gray-400">EHR integrations, lab systems, and courier APIs</p>
            
            <div className="mt-8 space-y-6">
              {/* Active Connectors */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Active Connectors</h2>
                  <p className="text-sm text-gray-400">Healthcare system integrations and data flows</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4 border border-green-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                          <h3 className="text-sm font-medium text-white">Epic EHR</h3>
                        </div>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Connected</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">FHIR R4 integration for patient data exchange</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Last sync: 5 min ago • 234 records</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-green-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                          <h3 className="text-sm font-medium text-white">UNOS DonorNet</h3>
                        </div>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Connected</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Real-time organ allocation and status updates</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Last sync: 2 min ago • 12 cases</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-yellow-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                          <h3 className="text-sm font-medium text-white">LabCorp LIS</h3>
                        </div>
                        <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">Syncing</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Laboratory results and serology data feed</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Last sync: 15 min ago • 89 results</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connector Marketplace */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Connector Marketplace</h2>
                  <p className="text-sm text-gray-400">Available integrations for healthcare systems</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">Allscripts</h3>
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">EHR</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Electronic health records system integration</p>
                      <button className="w-full text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Install
                      </button>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">Quest Diagnostics</h3>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">LIS</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Laboratory information system connector</p>
                      <button className="w-full text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Install
                      </button>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">UPS Healthcare</h3>
                        <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">Courier</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Temperature-controlled logistics tracking</p>
                      <button className="w-full text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Install
                      </button>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">Medtronic Hugo</h3>
                        <span className="text-xs bg-purple-600 text-purple-100 px-2 py-1 rounded">IoT</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Surgical robotics data integration</p>
                      <button className="w-full text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Install
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Flow Monitoring */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Data Flow Monitoring</h2>
                  <p className="text-sm text-gray-400">Real-time integration performance and health</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Inbound Data</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Lab Results</span>
                          <span className="text-sm text-green-400">89/min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Patient Records</span>
                          <span className="text-sm text-blue-400">23/min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Shipping Updates</span>
                          <span className="text-sm text-yellow-400">12/min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Outbound Data</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Case Updates</span>
                          <span className="text-sm text-green-400">45/min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Status Reports</span>
                          <span className="text-sm text-blue-400">15/min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Alert Notifications</span>
                          <span className="text-sm text-red-400">3/min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">System Health</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">API Latency</span>
                          <span className="text-sm text-green-400">145ms</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Success Rate</span>
                          <span className="text-sm text-green-400">99.8%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-sm text-gray-300">Failed Requests</span>
                          <span className="text-sm text-red-400">2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>);
}
