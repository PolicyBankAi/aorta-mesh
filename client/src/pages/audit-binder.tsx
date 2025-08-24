import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  FileText,
  Download,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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
              Audit Binder
            </h1>
            <p className="text-gray-400">
              Compliance documentation and audit trail generation
            </p>

            <div className="mt-8 space-y-6">
              {/* Audit Package Generation */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Audit Package Generation
                  </h2>
                  <p className="text-sm text-gray-400">
                    Generate compliance packages for regulatory audits
                  </p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "FDA Audit Package",
                      desc: "21 CFR 1271 compliance documentation",
                      icon: <FileText className="h-5 w-5 text-blue-400 mr-2" />,
                      border: "blue",
                      stats: [
                        ["Documents:", "234 files"],
                        ["Cases:", "45 included"],
                        ["Format:", "PDF/A + JSON"],
                      ],
                      btnColor: "blue",
                    },
                    {
                      title: "AATB Standards Package",
                      desc: "American Association of Tissue Banks audit",
                      icon: <Shield className="h-5 w-5 text-green-400 mr-2" />,
                      border: "green",
                      stats: [
                        ["Documents:", "189 files"],
                        ["Cases:", "67 included"],
                        ["Format:", "PDF/A + XML"],
                      ],
                      btnColor: "green",
                    },
                    {
                      title: "GDPR Data Package",
                      desc: "EU GDPR compliance and data export",
                      icon: <FileText className="h-5 w-5 text-purple-400 mr-2" />,
                      border: "purple",
                      stats: [
                        ["Records:", "1,247 entries"],
                        ["Consent:", "All verified"],
                        ["Format:", "JSON + CSV"],
                      ],
                      btnColor: "purple",
                    },
                  ].map((pkg) => (
                    <div
                      key={pkg.title}
                      className={`bg-gray-700 rounded-lg p-4 border border-${pkg.border}-500 hover:border-${pkg.border}-400 cursor-pointer transition-colors`}
                    >
                      <div className="flex items-center mb-3">
                        {pkg.icon}
                        <h3 className="text-sm font-medium text-white">
                          {pkg.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{pkg.desc}</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        {pkg.stats.map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span>{k}</span>
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        className={`w-full mt-3 bg-${pkg.btnColor}-600 text-white text-xs py-2 rounded hover:bg-${pkg.btnColor}-700`}
                      >
                        Generate Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain of Evidence */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Chain of Evidence
                  </h2>
                  <p className="text-sm text-gray-400">
                    Tamper-evident audit trail with cryptographic verification
                  </p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hash Chain */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Hash Chain Verification
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs space-y-2">
                      {[
                        {
                          block: "Block #1247",
                          status: "SHA256 verified",
                          hash: "a4b2c8d9e1f3g5h7i9j2k4l6m8n0p2q4r6s8t0u2v4w6x8y0z2",
                        },
                        {
                          block: "Block #1246",
                          status: "SHA256 verified",
                          hash: "b5c3d0e2f4g6h8i0j3k5l7m9n1p3q5r7s9t1u3v5w7x9y1z3",
                        },
                        {
                          block: "Genesis Block",
                          status: "SHA256 verified",
                          hash: undefined,
                        },
                      ].map((b) => (
                        <div key={b.block}>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-gray-300">
                              {b.block}: {b.status}
                            </span>
                          </div>
                          {b.hash && (
                            <div className="text-gray-500 ml-6">Hash: {b.hash}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Last Notarization
                        </span>
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                          Valid
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
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
                  {/* Audit Events */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Recent Audit Events
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {[
                        {
                          icon: <Clock className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />,
                          title: "Document Access",
                          desc: "Case DN-2024-0892 accessed by Dr. Sarah Chen",
                          meta: "18:14:32 UTC • IP: 10.0.1.45",
                        },
                        {
                          icon: (
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                          ),
                          title: "Form Submission",
                          desc: "FDA 21 CFR 1271 form completed and validated",
                          meta: "18:12:15 UTC • User: coordinator@mayo.edu",
                        },
                        {
                          icon: (
                            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5" />
                          ),
                          title: "Policy Change",
                          desc: "Data retention policy updated for EU region",
                          meta: "17:45:21 UTC • Admin: system@aortamesh.com",
                        },
                        {
                          icon: (
                            <Shield className="h-4 w-4 text-purple-400 mr-2 mt-0.5" />
                          ),
                          title: "Key Rotation",
                          desc: "Tenant encryption key rotated successfully",
                          meta: "17:30:00 UTC • Automated",
                        },
                      ].map((e) => (
                        <div key={e.title} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start">
                            {e.icon}
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">{e.title}</div>
                              <div className="text-xs text-gray-400">{e.desc}</div>
                              <div className="text-xs text-gray-500 mt-1">{e.meta}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">
                    Generated Compliance Reports
                  </h2>
                  <p className="text-sm text-gray-400">
                    Download and export audit documentation
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700 text-sm">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase tracking-wider">
                      <tr>
                        {[
                          "Report Type",
                          "Date Range",
                          "Cases",
                          "Size",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th key={h} className="px-6 py-3 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {[
                        {
                          type: "FDA 21 CFR 1271 Audit",
                          range: "Q3 2024",
                          cases: "234",
                          size: "45.2 MB",
                          status: "Ready",
                          color: "green",
                          action: true,
                        },
                        {
                          type: "AATB Standards Report",
                          range: "Q3 2024",
                          cases: "189",
                          size: "38.7 MB",
                          status: "Generating",
                          color: "yellow",
                          action: false,
                        },
                        {
                          type: "GDPR Data Export",
                          range: "Full History",
                          cases: "1,247",
                          size: "127.3 MB",
                          status: "Ready",
                          color: "green",
                          action: true,
                        },
                      ].map((r) => (
                        <tr key={r.type}>
                          <td className="px-6 py-4 text-gray-300">{r.type}</td>
                          <td className="px-6 py-4 text-gray-400">{r.range}</td>
                          <td className="px-6 py-4 text-gray-400">{r.cases}</td>
                          <td className="px-6 py-4 text-gray-400">{r.size}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${r.color}-100 text-${r.color}-800`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {r.action ? (
                              <button
                                className={`bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700`}
                              >
                                <Download className="h-3 w-3 inline mr-1" />
                                Download
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs">
                                Processing...
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
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
