import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function SmartForms() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must log in to access Smart Forms.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
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
            <h1 className="text-2xl font-semibold text-white mb-4">Smart Forms</h1>
            <p className="text-gray-400">
              Dynamic regulatory forms with validation and conditional logic
            </p>

            <div className="mt-8 space-y-6">
              {/* Form Templates */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Regulatory Form Templates
                  </h2>
                  <p className="text-sm text-gray-400">
                    Dynamic forms with jurisdiction-specific validation
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Example form cards */}
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">FDA 21 CFR 1271</h3>
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                          US
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        Tissue establishment registration and product listing
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>12 fields • 4 validation rules</span>
                      </div>
                    </div>

                    {/* Repeat for AATB, EU Directive, UNOS, Consent, Chain-of-Custody */}
                    {/* ... */}
                  </div>
                </div>
              </div>

              {/* Form Builder */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Form Builder</h2>
                  <p className="text-sm text-gray-400">
                    Create custom forms with conditional logic and validation
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* JSON Schema */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        JSON Schema Definition
                      </h3>
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                        <pre className="text-gray-300">
{`{
  "title": "Donor Information Form",
  "type": "object",
  "required": ["donorId", "age", "bloodType"],
  "properties": {
    "donorId": { "type": "string", "pattern": "^DN-[0-9]{4}-[0-9]{4}$" },
    "age": { "type": "integer", "minimum": 0, "maximum": 120 },
    "bloodType": {
      "type": "string",
      "enum": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    }
  }
}`}
                        </pre>
                      </div>
                    </div>

                    {/* Validation Rules */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Validation Rules
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Age Validation</span>
                            <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Must be between 0 and 120 years
                          </p>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Donor ID Format</span>
                            <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Must follow DN-YYYY-NNNN pattern
                          </p>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Blood Type Check</span>
                            <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Must be valid ABO/Rh type
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Submissions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Recent Form Submissions
                  </h2>
                  <p className="text-sm text-gray-400">
                    Latest form completions and validations
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Form</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Case ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-300">FDA 21 CFR 1271</td>
                        <td className="px-6 py-4 text-sm text-gray-400">DN-2024-0892</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">2 hours ago</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Valid
                          </span>
                        </td>
                      </tr>

                      {/* More sample rows... */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
