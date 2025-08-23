import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-cyan-800 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-3xl font-bold text-white">AORTA Mesh™</h1>
            </div>
            <Button 
              onClick={async () => {
                // Direct demo login without showing login page
                console.log('Sign In button clicked - attempting demo login...');
                try {
                  const response = await fetch('/api/demo/login', { 
                    method: 'POST',
                    credentials: 'include' // Include cookies in request
                  });
                  console.log('Demo login response:', response.status, response.ok);
                  if (response.ok) {
                    console.log('Login successful, redirecting to dashboard...');
                    // Force a full page reload to refresh the authentication state
                    window.location.reload();
                  } else {
                    console.error('Login failed with status:', response.status);
                  }
                } catch (error) {
                  console.error('Demo login error:', error);
                }
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            AORTA Mesh™ — Advanced Organ & Tissue Record Traceability
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-4 font-medium">
            End-to-end compliance and auditability for the organ and tissue banking lifecycle.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Enterprise-grade federated platform for tissue banks, organ procurement 
            organizations, and transplant centers with cryptographically signed Case Passports.
          </p>
          <Button 
            onClick={async () => {
              // Direct demo login without showing login page
              console.log('Hero Sign In button clicked - attempting demo login...');
              try {
                const response = await fetch('/api/demo/login', { 
                  method: 'POST',
                  credentials: 'include' // Include cookies in request
                });
                console.log('Demo login response:', response.status, response.ok);
                if (response.ok) {
                  console.log('Login successful, redirecting to dashboard...');
                  // Force a full page reload to refresh the authentication state
                  window.location.reload();
                } else {
                  console.error('Login failed with status:', response.status);
                }
              } catch (error) {
                console.error('Demo login error:', error);
              }
            }}
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gray-900 border-cyan-800">
            <CardHeader>
              <Shield className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">HIPAA Compliant</CardTitle>
              <CardDescription className="text-gray-400">
                Full HIPAA/AATB/GDPR compliance with enterprise-grade security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-900 border-cyan-800">
            <CardHeader>
              <FileText className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">Case Passports</CardTitle>
              <CardDescription className="text-gray-400">
                Cryptographically signed documentation for every donor and tissue lot
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-900 border-cyan-800">
            <CardHeader>
              <Activity className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">Chain of Custody</CardTitle>
              <CardDescription className="text-gray-400">
                Complete traceability from recovery to transplantation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-900 border-cyan-800">
            <CardHeader>
              <Users className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">Multi-Tenant</CardTitle>
              <CardDescription className="text-gray-400">
                Federated architecture with secure organization isolation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Benefits */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-8">Trusted by Healthcare Organizations</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
              <p className="text-gray-300">Uptime SLA</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">10k+</div>
              <p className="text-gray-300">Concurrent Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">100k+</div>
              <p className="text-gray-300">Cases Per Year</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-800 bg-black py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 AORTA Mesh™. Enterprise-grade organ and tissue traceability platform.</p>
        </div>
      </footer>
    </div>
  );
}