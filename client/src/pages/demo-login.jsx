import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, User } from "lucide-react";
import { useState } from "react";
export default function DemoLogin() {
    const [isLogging, setIsLogging] = useState(false);
    const handleDemoLogin = async () => {
        setIsLogging(true);
        try {
            const response = await fetch('/api/demo/login', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            }
            else {
                console.error('Demo login failed');
                setIsLogging(false);
            }
        }
        catch (error) {
            console.error('Demo login error:', error);
            setIsLogging(false);
        }
    };
    return (<div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-cyan-800">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-black"/>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              AORTA Mesh™
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">
              Advanced Organ & Tissue Record Traceability
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white mb-2">
              Demo Access
            </h2>
            <p className="text-sm text-gray-400">
              Experience the full AORTA Mesh platform with demo data
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <User className="w-5 h-5 text-cyan-400"/>
              <span>Demo User Account</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Lock className="w-5 h-5 text-cyan-400"/>
              <span>Full Platform Access</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Shield className="w-5 h-5 text-cyan-400"/>
              <span>Sample Case Passports</span>
            </div>
          </div>

          <Button onClick={handleDemoLogin} disabled={isLogging} className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-3" data-testid="button-demo-login">
            {isLogging ? "Signing In..." : "Enter Demo"}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              This is a demonstration environment with sample data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);
}
