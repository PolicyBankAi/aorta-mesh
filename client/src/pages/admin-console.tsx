import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Shield, Users, Settings, Database, Activity, Lock } from "lucide-react";

export default function AdminConsole() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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
            <h1 className="text-2xl font-semibold text-white mb-4">Admin Console</h1>
            <p className="text-gray-400">Enterprise administration and tenant management</p>
            
            <div className="mt-8 space-y-6">
              {/* Identity & Access Management */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-400 mr-2" />
                    <h2 className="text-lg font-medium text-white">Identity & Access Management</h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">SSO, RBAC, and user lifecycle management</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">SSO Configuration</h3>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Active</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">OIDC/SAML integration with JIT provisioning</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Provider:</span>
                          <span className="text-gray-300">Azure AD</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Users:</span>
                          <span className="text-gray-300">1,247</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">SCIM:</span>
                          <span className="text-green-400">Enabled</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">Role-Based Access</h3>
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">Configured</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">RBAC + ABAC with separation of duties</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Roles:</span>
                          <span className="text-gray-300">12 defined</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Policies:</span>
                          <span className="text-gray-300">47 active</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">SoD Rules:</span>
                          <span className="text-yellow-400">8 enforced</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">User Lifecycle</h3>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Automated</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">SCIM 2.0 provisioning and deprovisioning</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Provision Time:</span>
                          <span className="text-gray-300">&lt; 2 min</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Deprovision:</span>
                          <span className="text-gray-300">&lt; 5 min</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Group Sync:</span>
                          <span className="text-green-400">Real-time</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Security & Privacy */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-red-400 mr-2" />
                    <h2 className="text-lg font-medium text-white">Data Security & Privacy</h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Encryption, PII protection, and data residency</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Encryption & Key Management</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Per-Tenant KEKs</span>
                            <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Active</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                              <span>Key Rotation:</span>
                              <span>90 days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>HSM Integration:</span>
                              <span className="text-green-400">AWS KMS</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Field-Level Encryption</span>
                            <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Enabled</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                              <span>PHI Fields:</span>
                              <span>12 encrypted</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Search Tokens:</span>
                              <span className="text-green-400">Deterministic</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Privacy & Compliance</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Data Residency</span>
                            <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">Configured</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                              <span>US Region:</span>
                              <span>us-east-1</span>
                            </div>
                            <div className="flex justify-between">
                              <span>EU Region:</span>
                              <span>eu-west-1</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">PII-Aware Logging</span>
                            <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Active</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                              <span>Redaction:</span>
                              <span className="text-green-400">Automatic</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sampling Rate:</span>
                              <span>1%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tenant Management */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-purple-400 mr-2" />
                    <h2 className="text-lg font-medium text-white">Tenant Management</h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Multi-tenant configuration and resource management</p>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tenant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Users</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cases</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Storage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Mayo Clinic</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Enterprise</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">2,341</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">45,231</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">2.3 TB</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Johns Hopkins</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Enterprise</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">1,892</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">38,176</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">1.9 TB</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Regional OPO</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Professional</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">156</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">3,428</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">456 GB</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Trial
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* System Health & Monitoring */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-green-400 mr-2" />
                    <h2 className="text-lg font-medium text-white">System Health & SLOs</h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Service level objectives and performance monitoring</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">99.97%</div>
                        <div className="text-sm text-gray-300">Uptime SLA</div>
                        <div className="text-xs text-gray-500 mt-1">Target: 99.95%</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">142ms</div>
                        <div className="text-sm text-gray-300">API P95 Latency</div>
                        <div className="text-xs text-gray-500 mt-1">Target: &lt;200ms</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">389ms</div>
                        <div className="text-sm text-gray-300">Search P95</div>
                        <div className="text-xs text-gray-500 mt-1">Target: &lt;500ms</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">18s</div>
                        <div className="text-sm text-gray-300">Binder Compile</div>
                        <div className="text-xs text-gray-500 mt-1">Target: &lt;30s</div>
                      </div>
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