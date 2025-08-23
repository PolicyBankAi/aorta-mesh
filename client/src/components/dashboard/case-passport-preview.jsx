import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
// Mock data for demonstration - in production this would come from API
const mockCasePassport = {
    id: "12345",
    title: "Case Passport",
    status: "Active",
    lastUpdated: "Too X:15 AM",
    documents: [
        { name: "Donor History Questionnaire", type: "PDr", size: "23 MB", status: "complete" },
        { name: "Recovery Form", type: "PDr", size: "14 MB", status: "complete" },
        { name: "Test Results", type: "PDr", size: "14 MB", status: "complete" },
    ],
};
const statusColors = {
    complete: "bg-green-900 text-green-200",
    pending: "bg-yellow-900 text-yellow-200",
    missing: "bg-red-900 text-red-200",
};
export default function CasePassportPreview() {
    const [activeTab, setActiveTab] = useState("documents");
    return (<Card className="bg-black border-cyan-400 shadow rounded-lg h-full" data-testid="case-passport-preview">
      <CardHeader className="border-b border-cyan-400">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-cyan-400">{mockCasePassport.title} {mockCasePassport.id}</h3>
            <p className="mt-1 text-sm text-cyan-300" data-testid="case-passport-last-updated">
              Last Updated {mockCasePassport.lastUpdated}
            </p>
          </div>
          <Badge className="bg-cyan-600 text-black border border-cyan-400" data-testid="case-passport-status">
            {mockCasePassport.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="case-passport-tabs">
          <TabsList className="border-b border-cyan-400 bg-transparent w-full justify-start h-auto p-0 px-6">
            <TabsTrigger value="documents" className="border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 bg-transparent px-0 py-3 mr-6 text-cyan-300" data-testid="tab-documents">
              Documents
            </TabsTrigger>
            <TabsTrigger value="smart-forms" className="border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 bg-transparent px-0 py-3 mr-6 text-cyan-300" data-testid="tab-smart-forms">
              Smart Forms
            </TabsTrigger>
            <TabsTrigger value="audit-binder" className="border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 bg-transparent px-0 py-3 text-cyan-300" data-testid="tab-audit-binder">
              Audit Binder
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="documents" className="mt-0">
              <div className="space-y-3">
                {mockCasePassport.documents.map((doc, index) => (<div key={index} className="flex items-center justify-between p-3 bg-black border border-cyan-400 rounded-lg" data-testid={`document-${index}`}>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-cyan-400"/>
                      <div>
                        <div className="text-sm text-cyan-300">{doc.name}</div>
                        <div className="text-xs text-cyan-500">{doc.type}</div>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400">{doc.size}</span>
                  </div>))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="sm" className="text-cyan-300 border-cyan-400 hover:bg-gray-800">
                  Grant Access
                </Button>
                <Button variant="outline" size="sm" className="text-cyan-300 border-cyan-400 hover:bg-gray-800">
                  Revoke Access
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="smart-forms" className="mt-0">
              <div className="text-center py-8 text-cyan-400" data-testid="smart-forms-placeholder">
                Smart forms would be displayed here.
              </div>
            </TabsContent>

            <TabsContent value="audit-binder" className="mt-0">
              <div className="text-center py-8 text-cyan-400" data-testid="audit-binder-placeholder">
                Audit binder information would be displayed here.
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>);
}
