import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  Upload,
  Download,
  Share,
  Tag,
  Archive,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function BulkOperations() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeJobs, setActiveJobs] = useState([
    {
      id: "job-001",
      type: "Bulk Share",
      operation: "Share 45 case passports with Mayo Clinic",
      status: "in_progress",
      progress: 73,
      startedAt: "2024-08-17 15:45:00",
      estimatedCompletion: "2024-08-17 16:12:00",
      totalItems: 45,
      processedItems: 33,
      errorCount: 0,
    },
    {
      id: "job-002",
      type: "Bulk Label",
      operation: "Apply 'Q3-2024-Audit' tags to 156 documents",
      status: "queued",
      progress: 0,
      startedAt: null,
      estimatedCompletion: "2024-08-17 16:30:00",
      totalItems: 156,
      processedItems: 0,
      errorCount: 0,
    },
  ]);

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

  const completedJobs = [
    {
      id: "job-003",
      type: "Bulk Compile",
      operation: "Generated audit binders for 23 cases",
      completedAt: "2024-08-17 14:30:00",
      status: "completed",
      totalItems: 23,
      successCount: 23,
      errorCount: 0,
      duration: "12 minutes",
    },
    {
      id: "job-004",
      type: "CSV Import",
      operation: "Imported donor data from external system",
      completedAt: "2024-08-17 13:15:00",
      status: "completed_with_errors",
      totalItems: 89,
      successCount: 87,
      errorCount: 2,
      duration: "8 minutes",
    },
  ];

  const bulkTemplates = [
    {
      id: "template-001",
      name: "FDA Audit Export",
      description: "Export case data in FDA-compliant format",
      fields: [
        "case_id",
        "donor_id",
        "tissue_type",
        "processing_date",
        "qa_status",
      ],
      downloadUrl: "/templates/fda_audit_template.csv",
    },
    {
      id: "template-002",
      name: "AATB Standards Import",
      description: "Import tissue bank data following AATB standards",
      fields: [
        "donor_id",
        "consent_date",
        "serology_results",
        "tissue_recovery_date",
      ],
      downloadUrl: "/templates/aatb_import_template.csv",
    },
    {
      id: "template-003",
      name: "Chain-of-Custody Bulk Update",
      description: "Update custody information for multiple cases",
      fields: [
        "case_id",
        "custody_transfer_date",
        "receiving_facility",
        "temperature_log",
      ],
      downloadUrl: "/templates/custody_update_template.csv",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "completed_with_errors":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartBulkOperation = (operationType: string) => {
    toast({
      title: "Bulk Operation Started",
      description: `${operationType} operation has been queued and will begin processing shortly.`,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  Bulk Operations
                </h1>
                <p className="text-gray-400">
                  Bulk share, label, compile, and CSV import with field mapping
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-300 border-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Templates
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  New Import
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="operations" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
                <TabsTrigger value="operations" className="text-gray-300 data-[state=active]:text-white">
                  Bulk Operations
                </TabsTrigger>
                <TabsTrigger value="import" className="text-gray-300 data-[state=active]:text-white">
                  CSV Import
                </TabsTrigger>
                <TabsTrigger value="jobs" className="text-gray-300 data-[state=active]:text-white">
                  Active Jobs
                </TabsTrigger>
                <TabsTrigger value="history" className="text-gray-300 data-[state=active]:text-white">
                  Job History
                </TabsTrigger>
              </TabsList>

              {/* Bulk Operations Tab */}
              <TabsContent value="operations" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Bulk Share",
                      desc: "Share multiple case passports with external organizations or internal teams",
                      icon: <Share className="h-5 w-5 text-blue-400" />,
                      btn: "Start Bulk Share",
                      color: "blue",
                    },
                    {
                      title: "Bulk Label",
                      desc: "Apply tags and labels to multiple documents and cases simultaneously",
                      icon: <Tag className="h-5 w-5 text-green-400" />,
                      btn: "Start Bulk Label",
                      color: "green",
                    },
                    {
                      title: "Bulk Compile",
                      desc: "Generate audit binders and compliance packages for multiple cases",
                      icon: <Archive className="h-5 w-5 text-purple-400" />,
                      btn: "Start Bulk Compile",
                      color: "purple",
                    },
                  ].map((op) => (
                    <Card key={op.title} className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          {op.icon}
                          <CardTitle className="text-white text-base">
                            {op.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 mb-4">{op.desc}</p>
                        <Button
                          onClick={() => handleStartBulkOperation(op.title)}
                          className={`w-full bg-${op.color}-600 hover:bg-${op.color}-700`}
                          size="sm"
                        >
                          {op.btn}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* CSV Import Tab */}
              <TabsContent value="import" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileSpreadsheet className="h-5 w-5 mr-2 text-blue-400" />
                      CSV Import Wizard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Templates */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">
                          Import Templates
                        </h3>
                        <div className="space-y-3">
                          {bulkTemplates.map((t) => (
                            <div key={t.id} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-white">{t.name}</h4>
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" /> Download
                                </Button>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">{t.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {t.fields.map((f) => (
                                  <Badge key={f} variant="outline" className="text-xs text-gray-300 border-gray-600">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Mapping Preview */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">
                          Field Mapping Preview
                        </h3>
                        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between border-b border-gray-600 pb-2 text-sm text-gray-300">
                            <span>CSV Column</span>
                            <span>AORTA Field</span>
                          </div>
                          {[
                            ["donor_id", "Donor.ID"],
                            ["consent_date", "Consent.Date"],
                            ["tissue_type", "Tissue.Type"],
                            ["qa_status", "QA.Status"],
                          ].map(([c, f]) => (
                            <div key={c} className="flex justify-between text-sm">
                              <span className="text-gray-400">{c}</span>
                              <span className="text-blue-400">{f}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload CSV File
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Active Jobs Tab */}
              <TabsContent value="jobs" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2 text-blue-400" />
                      Active Jobs ({activeJobs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeJobs.map((job) => (
                      <div key={job.id} className="bg-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-3">
                          <div>
                            <h4 className="text-sm text-white">{job.operation}</h4>
                            <p className="text-xs text-gray-400">{job.type}</p>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span className="text-gray-300">
                                {job.processedItems}/{job.totalItems} items
                              </span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                          <div className="grid grid-cols-3 text-xs gap-4">
                            <div>
                              <p className="text-gray-400">Started</p>
                              <p className="text-gray-300">{job.startedAt || "Queued"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Est. Completion</p>
                              <p className="text-gray-300">{job.estimatedCompletion}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Errors</p>
                              <p className={job.errorCount ? "text-red-400" : "text-gray-300"}>
                                {job.errorCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Completed Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="min-w-full divide-y divide-gray-700 text-sm">
                      <thead className="bg-gray-700 text-gray-300 text-xs">
                        <tr>
                          {["Operation", "Type", "Completed", "Status", "Results", "Duration"].map((h) => (
                            <th key={h} className="px-6 py-3 text-left font-medium uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {completedJobs.map((job) => (
                          <tr key={job.id}>
                            <td className="px-6 py-4 text-white">{job.operation}</td>
                            <td className="px-6 py-4 text-gray-300">{job.type}</td>
                            <td className="px-6 py-4 text-gray-400">{job.completedAt}</td>
                            <td className="px-6 py-4">
                              <Badge className={getStatusColor(job.status)}>
                                {job.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              <span className="text-green-400">{job.successCount}</span> success
                              {job.errorCount > 0 && (
                                <span className="ml-2 text-red-400">{job.errorCount} errors</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-300">{job.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
