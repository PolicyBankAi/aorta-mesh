import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Upload, Download, Share, Tag, Archive, CheckSquare, RefreshCw, FileSpreadsheet } from "lucide-react";
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
      errorCount: 0
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
      errorCount: 0
    }
  ]);

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
      duration: "12 minutes"
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
      duration: "8 minutes"
    }
  ];

  const bulkTemplates = [
    {
      id: "template-001",
      name: "FDA Audit Export",
      description: "Export case data in FDA-compliant format",
      fields: ["case_id", "donor_id", "tissue_type", "processing_date", "qa_status"],
      downloadUrl: "/templates/fda_audit_template.csv"
    },
    {
      id: "template-002",
      name: "AATB Standards Import",
      description: "Import tissue bank data following AATB standards",
      fields: ["donor_id", "consent_date", "serology_results", "tissue_recovery_date"],
      downloadUrl: "/templates/aatb_import_template.csv"
    },
    {
      id: "template-003",
      name: "Chain-of-Custody Bulk Update",
      description: "Update custody information for multiple cases",
      fields: ["case_id", "custody_transfer_date", "receiving_facility", "temperature_log"],
      downloadUrl: "/templates/custody_update_template.csv"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "queued": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "completed_with_errors": return "bg-orange-100 text-orange-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">Bulk Operations</h1>
                <p className="text-gray-400">Bulk share, label, compile, and CSV import with field mapping</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export Templates
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  New Import
                </Button>
              </div>
            </div>
            
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
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <Share className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white text-base">Bulk Share</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">
                        Share multiple case passports with external organizations or internal teams
                      </p>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400">
                          <p>• Select multiple cases</p>
                          <p>• Choose recipients and permissions</p>
                          <p>• Set expiration dates</p>
                          <p>• Track access and downloads</p>
                        </div>
                        <Button 
                          onClick={() => handleStartBulkOperation("Bulk Share")}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          Start Bulk Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-5 w-5 text-green-400" />
                        <CardTitle className="text-white text-base">Bulk Label</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">
                        Apply tags and labels to multiple documents and cases simultaneously
                      </p>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400">
                          <p>• Add classification tags</p>
                          <p>• Apply audit periods</p>
                          <p>• Set retention policies</p>
                          <p>• Compliance categorization</p>
                        </div>
                        <Button 
                          onClick={() => handleStartBulkOperation("Bulk Label")}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          Start Bulk Label
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <Archive className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white text-base">Bulk Compile</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">
                        Generate audit binders and compliance packages for multiple cases
                      </p>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400">
                          <p>• FDA audit packages</p>
                          <p>• AATB compliance binders</p>
                          <p>• GDPR data exports</p>
                          <p>• Custom report formats</p>
                        </div>
                        <Button 
                          onClick={() => handleStartBulkOperation("Bulk Compile")}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          Start Bulk Compile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Import Templates</h3>
                        <div className="space-y-3">
                          {bulkTemplates.map((template) => (
                            <div key={template.id} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-white">{template.name}</h4>
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">{template.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {template.fields.map((field, index) => (
                                  <Badge key={index} variant="outline" className="text-xs text-gray-300 border-gray-600">
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Field Mapping Preview</h3>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-600">
                              <span className="text-sm text-gray-300">CSV Column</span>
                              <span className="text-sm text-gray-300">AORTA Field</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">donor_id</span>
                                <span className="text-sm text-blue-400">Donor.ID</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">consent_date</span>
                                <span className="text-sm text-blue-400">Consent.Date</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">tissue_type</span>
                                <span className="text-sm text-blue-400">Tissue.Type</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">qa_status</span>
                                <span className="text-sm text-blue-400">QA.Status</span>
                              </div>
                            </div>
                          </div>
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
                    <div className="space-y-4">
                      {activeJobs.map((job) => (
                        <div key={job.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-medium text-white">{job.operation}</h4>
                              <p className="text-xs text-gray-400">{job.type}</p>
                            </div>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">Progress</span>
                                <span className="text-xs text-gray-300">
                                  {job.processedItems}/{job.totalItems} items
                                </span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <p className="text-gray-400">Started</p>
                                <p className="text-gray-300">{job.startedAt || 'Queued'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Est. Completion</p>
                                <p className="text-gray-300">{job.estimatedCompletion}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Errors</p>
                                <p className={job.errorCount > 0 ? "text-red-400" : "text-gray-300"}>
                                  {job.errorCount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Job History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Completed Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Operation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Completed
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Results
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Duration
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                          {completedJobs.map((job) => (
                            <tr key={job.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {job.operation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {job.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {job.completedAt}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getStatusColor(job.status)}>
                                  {job.status.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="text-gray-300">
                                  <span className="text-green-400">{job.successCount}</span> success
                                  {job.errorCount > 0 && (
                                    <span className="ml-2">
                                      <span className="text-red-400">{job.errorCount}</span> errors
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {job.duration}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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