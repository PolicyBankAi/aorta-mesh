import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseMedical, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Define stats shape
type Stats = {
  activeCases: number;
  flaggedDiscrepancies: number;
  auditsPending: number;
  complianceRate?: number;
};

const statsIcons = {
  activeCases: BriefcaseMedical,
  flaggedDiscrepancies: AlertTriangle,
  auditsPending: Clock,
  complianceRate: CheckCircle,
};

const statsColors = {
  activeCases: "text-primary-500",
  flaggedDiscrepancies: "text-yellow-500",
  auditsPending: "text-red-500",
  complianceRate: "text-green-500",
};

const statsLabels = {
  activeCases: "Active Cases",
  flaggedDiscrepancies: "Flagged Discrepancies",
  auditsPending: "Audits Pending",
  complianceRate: "Compliance Rate",
};

export default function StatsCards() {
  // ✅ Tell React Query that `stats` is of type `Stats`
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <>
        <Card className="bg-black border-cyan-400">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-12 bg-gray-800 mb-2" />
            <Skeleton className="h-6 bg-gray-800" />
          </CardContent>
        </Card>
        <Card className="bg-black border-cyan-400">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-12 bg-gray-800 mb-2" />
            <Skeleton className="h-6 bg-gray-800" />
          </CardContent>
        </Card>
        <Card className="bg-black border-cyan-400">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-12 bg-gray-800 mb-2" />
            <Skeleton className="h-6 bg-gray-800" />
          </CardContent>
        </Card>
      </>
    );
  }

  // ✅ Default values
  const defaultStats: Stats = {
    activeCases: 128,
    flaggedDiscrepancies: 5,
    auditsPending: 2,
    complianceRate: 95,
  };

  const displayStats = stats || defaultStats;

  return (
    <>
      <Card className="bg-black border-cyan-400 overflow-hidden shadow rounded-lg">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl font-bold text-cyan-400 mb-2"
            data-testid="stat-active-cases"
          >
            {displayStats.activeCases}
          </div>
          <div className="text-sm text-cyan-300">Active Cases</div>
        </CardContent>
      </Card>

      <Card className="bg-black border-cyan-400 overflow-hidden shadow rounded-lg">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl font-bold text-cyan-400 mb-2"
            data-testid="stat-flagged-discrepancies"
          >
            {displayStats.flaggedDiscrepancies}
          </div>
          <div className="text-sm text-cyan-300">Flagged Discrepancies</div>
        </CardContent>
      </Card>

      <Card className="bg-black border-cyan-400 overflow-hidden shadow rounded-lg">
        <CardContent className="p-6 text-center">
          <div
            className="text-4xl font-bold text-cyan-400 mb-2"
            data-testid="stat-audits-pending"
          >
            {displayStats.auditsPending}
          </div>
          <div className="text-sm text-cyan-300">Audits Pending</div>
        </CardContent>
      </Card>
    </>
  );
}
