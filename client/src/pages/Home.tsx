import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, LogOut, User, Building2 } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const typedUser = user as UserType | undefined;

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
            <div className="flex items-center space-x-4">
              {typedUser && (
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-300">{typedUser.firstName} {typedUser.lastName}</span>
                </div>
              )}
              <Button 
                onClick={async () => {
                  try {
                    // Try demo logout first (will fail in production)
                    const response = await fetch('/api/demo/logout', { method: 'POST' });
                    if (response.ok) {
                      window.location.reload();
                    } else {
                      window.location.href = '/api/logout';
                    }
                  } catch {
                    // Fallback to production logout
                    window.location.href = '/api/logout';
                  }
                }}
                variant="outline"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to AORTA Mesh™ — Advanced Organ & Tissue Record Traceability
          </h2>
          <p className="text-2xl text-cyan-300 max-w-4xl font-medium mb-2">
            End-to-end compliance and auditability for the organ and tissue banking lifecycle.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl">
            Your secure, enterprise-grade platform for organ and tissue traceability. 
            Access all your tools and manage case passports with full compliance and audit capabilities.
          </p>
        </div>

        {typedUser && (
          <Card className="bg-gray-900 border-cyan-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-cyan-400" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p><strong>Name:</strong> {typedUser.firstName} {typedUser.lastName}</p>
                  <p><strong>Email:</strong> {typedUser.email}</p>
                </div>
                <div>
                  <p><strong>Role:</strong> {typedUser.role}</p>
                  <p><strong>Organization:</strong> {typedUser.organizationId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard">
            <Card className="bg-gray-900 border-cyan-800 hover:border-cyan-600 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Dashboard</CardTitle>
                <CardDescription className="text-gray-400">
                  View key metrics, alerts, and system overview
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/case-passports">
            <Card className="bg-gray-900 border-cyan-800 hover:border-cyan-600 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Case Passports</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage donor cases and tissue lot documentation
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/qa-workbench">
            <Card className="bg-gray-900 border-cyan-800 hover:border-cyan-600 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">QA Workbench</CardTitle>
                <CardDescription className="text-gray-400">
                  Quality assurance alerts and compliance monitoring
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/chain-of-custody">
            <Card className="bg-gray-900 border-cyan-800 hover:border-cyan-600 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Chain of Custody</CardTitle>
                <CardDescription className="text-gray-400">
                  Track movement and handling throughout the process
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/smart-forms">
            <Card className="bg-gray-900 border-cyan-800 hover:border-cyan-600 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Smart Forms</CardTitle>
                <CardDescription className="text-gray-400">
                  Regulatory templates and automated compliance
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/audit-binder">
            <Card className="bg-gray-900 border-cyan-800 hover:border-cyan-600 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white">Audit Binder</CardTitle>
                <CardDescription className="text-gray-400">
                  Immutable audit logs and compliance reports
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}