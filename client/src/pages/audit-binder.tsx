import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { FileText, Download, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function AuditBinder() {
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
            <h1 className="text-2xl font-semibold text-white mb-4">Audit Binder</h1>
            <p className="text-gray-400">Compliance documentation and audit trail generation</p>
            
            <div className="mt-8 space-y-6">
              {/* Audit Package Generation */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Audit Package Generation</h2>
                  <p className="text-sm text-gray-400">Generate compliance packages for regulatory audits</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4 border border-blue-500 hover:border-blue-400 cursor-pointer transition-colors">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-sm font-medium text-white">FDA Audit Package</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">21 CFR 1271 compliance documentation</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Documents:</span>
                          <span>234 files</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cases:</span>
                          <span>45 included</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span>PDF/A + JSON</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700">
                        Generate Package
                      </button>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-green-500 hover:border-green-400 cursor-pointer transition-colors">
                      <div className="flex items-center mb-3">
                        <Shield className="h-5 w-5 text-green-400 mr-2" />
                        <h3 className="text-sm font-medium text-white">AATB Standards Package</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">American Association of Tissue Banks audit</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Documents:</span>
                          <span>189 files</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cases:</span>
                          <span>67 included</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span>PDF/A + XML</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700">
                        Generate Package
                      </button>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 border border-purple-500 hover:border-purple-400 cursor-pointer transition-colors">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-purple-400 mr-2" />
                        <h3 className="text-sm font-medium text-white">GDPR Data Package</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">EU GDPR compliance and data export</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Records:</span>
                          <span>1,247 entries</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Consent:</span>
                          <span>All verified</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span>JSON + CSV</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-purple-600 text-white text-xs py-2 rounded hover:bg-purple-700">
                        Generate Package
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Audit Trail & Chain of Evidence */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Chain of Evidence</h2>
                  <p className="text-sm text-gray-400">Tamper-evident audit trail with cryptographic verification</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Hash Chain Verification</h3>
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-gray-300">Block #1247: SHA256 verified</span>
                          </div>
                          <div className="text-gray-500 ml-6">
                            Hash: a4b2c8d9e1f3g5h7i9j2k4l6m8n0p2q4r6s8t0u2v4w6x8y0z2
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-gray-300">Block #1246: SHA256 verified</span>
                          </div>
                          <div className="text-gray-500 ml-6">
                            Hash: b5c3d0e2f4g6h8i0j3k5l7m9n1p3q5r7s9t1u3v5w7x9y1z3
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-gray-300">Genesis Block: SHA256 verified</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Last Notarization</span>
                          <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">Valid</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Timestamp:</span>
                            <span>2024-08-17 18:15:42 UTC</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Anchor:</span>
                            <span>Bitcoin Testnet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Recent Audit Events</h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Document Access</div>
                              <div className="text-xs text-gray-400">Case DN-2024-0892 accessed by Dr. Sarah Chen</div>
                              <div className="text-xs text-gray-500 mt-1">18:14:32 UTC • IP: 10.0.1.45</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Form Submission</div>
                              <div className="text-xs text-gray-400">FDA 21 CFR 1271 form completed and validated</div>
                              <div className="text-xs text-gray-500 mt-1">18:12:15 UTC • User: coordinator@mayo.edu</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Policy Change</div>
                              <div className="text-xs text-gray-400">Data retention policy updated for EU region</div>
                              <div className="text-xs text-gray-500 mt-1">17:45:21 UTC • Admin: system@aortamesh.com</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start">
                            <Shield className="h-4 w-4 text-purple-400 mr-2 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Key Rotation</div>
                              <div className="text-xs text-gray-400">Tenant encryption key rotated successfully</div>
                              <div className="text-xs text-gray-500 mt-1">17:30:00 UTC • Automated</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Compliance Reports */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Generated Compliance Reports</h2>
                  <p className="text-sm text-gray-400">Download and export audit documentation</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Report Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date Range</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cases</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">FDA 21 CFR 1271 Audit</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Q3 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">234</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">45.2 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ready
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 mr-2">
                            <Download className="h-3 w-3 inline mr-1" />
                            Download
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">AATB Standards Report</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Q3 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">189</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">38.7 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Generating
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="text-gray-500 text-xs">Processing...</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">GDPR Data Export</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Full History</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">1,247</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">127.3 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ready
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 mr-2">
                            <Download className="h-3 w-3 inline mr-1" />
                            Download
                          </button>
                        </td>
                      </tr>
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