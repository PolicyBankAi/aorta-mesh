import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "complete" | "pending" | "missing";
  uploadedBy: string;
  uploadedAt: string;
}

interface CasePassport {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  documents: Document[];
}

const statusColors: Record<string, string> = {
  complete: "bg-green-900 text-green-200",
  pending: "bg-yellow-900 text-yellow-200",
  missing: "bg-red-900 text-red-200",
};

export default function CasePassportPreview() {
  const [activeTab, setActiveTab] = useState("documents");
  const [casePassport, setCasePassport] = useState<CasePassport | null>(null);

  // ✅ Fetch case passport from API
  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch("/api/case-passports/12345");
        if (!res.ok) throw new Error("Failed to fetch case passport");
        const data: CasePassport = await res.json();
        setCasePassport(data);
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Could not load case passport" });
      }
    }
    fetchCase();
  }, []);

  if (!casePassport) {
    return (
      <Card className="bg-black border-cyan-400 shadow rounded-lg h-full">
        <CardHeader>
          <h3 className="text-lg font-medium text-cyan-400">Loading case…</h3>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-cyan-400 shadow rounded-lg h-full" data-testid="case-passport-preview">
      <CardHeader className="border-b border-cyan-400">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-cyan-400">
              {casePassport.title} {casePassport.id}
            </h3>
            <p className="mt-1 text-sm text-cyan-300" data-testid="case-passport-last-updated">
              Last Updated {casePassport.lastUpdated}
            </p>
          </div>
          <Badge
            className="bg-cyan-600 text-black border border-cyan-400"
            data-testid="case-passport-status"
          >
            {casePassport.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="case-passport-tabs">
          <TabsList className="border-b border-cyan-400 bg-transparent w-full justify-start h-auto p-0 px-6">
            <TabsTrigger
              value="documents"
              className="border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 bg-transparent px-0 py-3 mr-6 text-cyan-300"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="smart-forms"
              className="border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 bg-transparent px-0 py-3 mr-6 text-cyan-300"
            >
              Smart Forms
            </TabsTrigger>
            <TabsTrigger
              value="audit-binder"
              className="border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 bg-transparent px-0 py-3 text-cyan-300"
            >
              Audit Binder
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            {/* Documents */}
            <TabsContent value="documents" className="mt-0">
              {casePassport.documents.length > 0 ? (
                <div className="space-y-3">
                  {casePassport.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-black border border-cyan-400 rounded-lg"
                      data-testid={`document-${doc.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-cyan-400" />
                        <div>
                          <div className="text-sm text-cyan-300">{doc.name}</div>
                          <div className="text-xs text-cyan-500">
                            {doc.type} • Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${statusColors[doc.status] || ""}`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-cyan-400">No documents uploaded yet.</div>
              )}
            </TabsContent>

            {/* Smart Forms */}
            <TabsContent value="smart-forms" className="mt-0">
              <div className="text-center py-8 text-cyan-400" data-testid="smart-forms-placeholder">
                Smart forms are not yet available for this case.
              </div>
            </TabsContent>

            {/* Audit Binder */}
            <TabsContent value="audit-binder" className="mt-0">
              <div className="text-center py-8 text-cyan-400" data-testid="audit-binder-placeholder">
                Audit binder entries will appear here once generated.
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
