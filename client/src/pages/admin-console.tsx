import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Shield, Settings, Database, Activity, Lock } from "lucide-react";

export default function AdminConsole() {
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
            <h1 className="text-2xl font-semibold text-white mb-4">Admin Console</h1>
            <p className="text-gray-400">
              Enterprise administration and tenant management
            </p>

            <div className="mt-8 space-y-6">
              {/* Identity & Access Management */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-400 mr-2" />
                    <h2 className="text-lg font-medium text-white">
                      Identity & Access Management
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    SSO, RBAC, and user lifecycle management
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* SSO */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">
                          SSO Configuration
                        </h3>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        OIDC/SAML integration with JIT provisioning
                      </p>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Provider:</span>
                          <span className="text-gray-300">Azure AD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Users:</span>
                          <span className="text-gray-300">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SCIM:</span>
                          <span className="text-green-400">Enabled</span>
                        </div>
                      </div>
                    </div>
                    {/* RBAC */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">
                          Role-Based Access
                        </h3>
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                          Configured
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        RBAC + ABAC with separation of duties
                      </p>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Roles:</span>
                          <span className="text-gray-300">12 defined</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Policies:</span>
                          <span className="text-gray-300">47 active</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SoD Rules:</span>
                          <span className="text-yellow-400">8 enforced</span>
                        </div>
                      </div>
                    </div>
                    {/* User Lifecycle */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">
                          User Lifecycle
                        </h3>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Automated
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        SCIM 2.0 provisioning and deprovisioning
                      </p>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Provision Time:</span>
                          <span className="text-gray-300">&lt; 2 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deprovision:</span>
                          <span className="text-gray-300">&lt; 5 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Group Sync:</span>
                          <span className="text-green-400">Real-time</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-red-400 mr-2" />
                    <h2 className="text-lg font-medium text-white">
                      Data Security & Privacy
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Encryption, PII protection, and data residency
                  </p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Encryption & Key Management
                    </h3>
                    <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Per-Tenant KEKs
                        </span>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
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
                    <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Field-Level Encryption
                        </span>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Enabled
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
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

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Privacy & Compliance
                    </h3>
                    <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Data Residency
                        </span>
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                          Configured
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
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
                    <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          PII-Aware Logging
                        </span>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
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

              {/* Tenant Management */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center">
                  <Database className="h-5 w-5 text-purple-400 mr-2" />
                  <h2 className="text-lg font-medium text-white">
                    Tenant Management
                  </h2>
                </div>
                <div className="p-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase tracking-wider">
                      <tr>
                        {["Tenant", "Plan", "Users", "Cases", "Storage", "Status"].map(
                          (col) => (
                            <th
                              key={col}
                              className="px-6 py-3 text-left font-medium"
                            >
                              {col}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700 text-sm">
                      {[
                        {
                          tenant: "Mayo Clinic",
                          plan: "Enterprise",
                          users: "2,341",
                          cases: "45,231",
                          storage: "2.3 TB",
                          status: "Active",
                          color: "green",
                        },
                        {
                          tenant: "Johns Hopkins",
                          plan: "Enterprise",
                          users: "1,892",
                          cases: "38,176",
                          storage: "1.9 TB",
                          status: "Active",
                          color: "green",
                        },
                        {
                          tenant: "Regional OPO",
                          plan: "Professional",
                          users: "156",
                          cases: "3,428",
                          storage: "456 GB",
                          status: "Trial",
                          color: "yellow",
                        },
                      ].map((t) => (
                        <tr key={t.tenant}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {t.tenant}
                          </td>
                          <td className="px-6 py-4 text-gray-400">{t.plan}</td>
                          <td className="px-6 py-4 text-gray-400">{t.users}</td>
                          <td className="px-6 py-4 text-gray-400">{t.cases}</td>
                          <td className="px-6 py-4 text-gray-400">{t.storage}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${t.color}-100 text-${t.color}-800`}
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center">
                  <Activity className="h-5 w-5 text-green-400 mr-2" />
                  <h2 className="text-lg font-medium text-white">
                    System Health & SLOs
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      value: "99.97%",
                      label: "Uptime SLA",
                      target: "99.95%",
                      color: "green",
                    },
                    {
                      value: "142ms",
                      label: "API P95 Latency",
                      target: "<200ms",
                      color: "green",
                    },
                    {
                      value: "389ms",
                      label: "Search P95",
                      target: "<500ms",
                      color: "yellow",
                    },
                    {
                      value: "18s",
                      label: "Binder Compile",
                      target: "<30s",
                      color: "green",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-gray-700 rounded-lg p-4 text-center"
                    >
                      <div
                        className={`text-2xl font-bold text-${metric.color}-400`}
                      >
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-300">{metric.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Target: {metric.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
