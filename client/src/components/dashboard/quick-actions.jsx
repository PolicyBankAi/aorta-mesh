import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText } from "lucide-react";
export default function QuickActions() {
    return (<Card className="bg-black border-cyan-400 shadow rounded-lg" data-testid="quick-actions">
      <CardHeader className="border-b border-cyan-400">
        <CardTitle className="text-cyan-400">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-black justify-start border border-cyan-400" data-testid="button-create-case-passport">
            <Plus className="mr-2 h-4 w-4"/>
            Create Case Passport
          </Button>
          <Button variant="secondary" className="w-full bg-black hover:bg-gray-900 text-cyan-300 border-cyan-400 justify-start" data-testid="button-upload-documents">
            <Upload className="mr-2 h-4 w-4"/>
            Upload Documents
          </Button>
          <Button variant="secondary" className="w-full bg-black hover:bg-gray-900 text-cyan-300 border-cyan-400 justify-start" data-testid="button-generate-audit-report">
            <FileText className="mr-2 h-4 w-4"/>
            Generate Audit Report
          </Button>
        </div>
      </CardContent>
    </Card>);
}
