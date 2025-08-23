import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
export default function Documents() {
    // ✅ Strongly typed queries
    const { data: casePassports, isLoading: loadingCases } = useQuery({
        queryKey: ["/api/case-passports"],
    });
    const { data: documents, isLoading } = useQuery({
        queryKey: ["/api/documents"],
    });
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (<Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3"/> Pending
          </Badge>);
            case "approved":
                return (<Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle className="w-3 h-3"/> Approved
          </Badge>);
            case "rejected":
                return (<Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3"/> Rejected
          </Badge>);
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    if (isLoading || loadingCases) {
        return (<div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Documents</h2>
            <p className="text-muted-foreground">
              Manage case passport documents and compliance files
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="bg-gray-900 border-gray-800">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-800 rounded animate-pulse"/>
                <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse"/>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 rounded animate-pulse"/>
                  <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse"/>
                </div>
              </CardContent>
            </Card>))}
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">Document Management</h2>
          <p className="text-muted-foreground">
            Upload and manage medical compliance documents for case passports
          </p>
        </div>
      </div>

      {/* Document Upload Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5"/>
            Upload New Document
          </CardTitle>
          <CardDescription>
            Upload medical documents, lab results, consent forms, and other compliance materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Document Type</label>
              <select className="w-full p-2 rounded-md bg-gray-800 border-gray-700 text-white" data-testid="select-document-type">
                <option value="serology">Serology Results</option>
                <option value="consent">Consent Form</option>
                <option value="recovery">Recovery Report</option>
                <option value="pathology">Pathology Report</option>
                <option value="imaging">Medical Imaging</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Case Passport</label>
              <select className="w-full p-2 rounded-md bg-gray-800 border-gray-700 text-white" data-testid="select-case-passport">
                {casePassports?.map((casePassport) => (<option key={casePassport.id} value={casePassport.id}>
                    {casePassport.donorNumber} - {casePassport.status}
                  </option>))}
              </select>
            </div>
          </div>

          <Button className="w-full" data-testid="button-upload-document">
            <div className="flex items-center justify-center gap-2 py-8">
              <Plus className="w-6 h-6"/>
              <span>Upload New Document</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents?.map((doc) => (<Card key={doc.id} className="bg-gray-900 border-gray-800" data-testid={`card-document-${doc.id}`}>
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4"/>
                  {doc.fileName}
                </span>
                {getStatusBadge(doc.status)}
              </CardTitle>
              <CardDescription>
                Type: {doc.documentType} • Case: {doc.casePassportId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                <p>Size: {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "N/A"}</p>
                {doc.reviewedAt && (<p>Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}</p>)}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" data-testid={`button-view-${doc.id}`}>
                  View
                </Button>
                {doc.status === "pending" && (<Button size="sm" variant="outline" data-testid={`button-review-${doc.id}`}>
                    Review
                  </Button>)}
              </div>
            </CardContent>
          </Card>))}
      </div>

      {/* Empty State */}
      {(!documents || documents.length === 0) && (<Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto"/>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">No documents found</h3>
                <p className="text-muted-foreground">
                  Upload your first document to get started with compliance tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>)}
    </div>);
}
