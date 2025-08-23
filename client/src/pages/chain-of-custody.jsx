import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
export default function ChainOfCustody() {
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
            <h1 className="text-2xl font-semibold text-white mb-4">Chain-of-Custody</h1>
            <p className="text-gray-400">Track custody transfers and cold chain monitoring</p>
            
            <div className="mt-8 space-y-6">
              {/* Chain-of-Custody Timeline */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Chain-of-Custody Events</h2>
                  <p className="text-sm text-gray-400">Complete custody transfer history</p>
                </div>
                
                <div className="p-6">
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true"/>
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-800">
                                <div className="h-3 w-3 bg-white rounded-full"/>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-300 font-medium">
                                  Organ Recovery
                                </p>
                                <p className="text-sm text-gray-400">
                                  Regional Medical Center, OR Suite 3
                                </p>
                                <p className="text-xs text-gray-500">
                                  Handler: Dr. Sarah Chen • Temperature: 4°C
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                <time dateTime="2024-08-17T14:30">Aug 17, 2:30 PM</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true"/>
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-800">
                                <div className="h-3 w-3 bg-white rounded-full"/>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-300 font-medium">
                                  Cold Storage Transfer
                                </p>
                                <p className="text-sm text-gray-400">
                                  Regional Organ Bank - Cold Storage Unit A
                                </p>
                                <p className="text-xs text-gray-500">
                                  Handler: Mark Johnson • Temperature: 2°C
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                <time dateTime="2024-08-17T15:45">Aug 17, 3:45 PM</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="bg-yellow-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-800">
                                <div className="h-3 w-3 bg-white rounded-full"/>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-300 font-medium">
                                  Quality Check Pending
                                </p>
                                <p className="text-sm text-gray-400">
                                  Awaiting final inspection before distribution
                                </p>
                                <p className="text-xs text-gray-500">
                                  Assigned: QA Team • Current Temperature: 3°C
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                <time dateTime="2024-08-17T16:15">Aug 17, 4:15 PM</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Temperature Monitoring */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Temperature Monitoring</h2>
                  <p className="text-sm text-gray-400">Continuous cold chain monitoring</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">3°</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Current Temperature</p>
                          <p className="text-xs text-gray-400">Within acceptable range</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">24h</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Monitoring Duration</p>
                          <p className="text-xs text-gray-400">No temperature alerts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">99%</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Compliance Rate</p>
                          <p className="text-xs text-gray-400">Excellent performance</p>
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
