import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseMedical, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

type Stats = {
  activeCases: number;
  flaggedDiscrepancies: number;
  auditsPending: number;
  complianceRate: number;
};

const statsConfig = [
  {
    key: "activeCases",
    label: "Active Cases",
    icon: BriefcaseMedical,
    color: "text-cyan-400",
  },
  {
    key: "flaggedDiscrepancies",
    label: "Flagged Discrepancies",
    icon: AlertTriangle,
    color: "text-yellow-400",
  },
  {
    key: "auditsPending",
    label: "Audits Pending",
    icon: Clock,
    color: "text-red-400",
  },
  {
    key: "complianceRate",
    label: "Compliance Rate",
    icon: CheckCircle,
    color: "text-green-400",
    suffix: "%",
  },
] as const;

export default function StatsCards() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <>
        {statsConfig.map((item, i) => (
          <Card key={i} className="bg-black border-cyan-400">
            <CardContent className="p-6 text-center">
              <Skeleton className="h-12 bg-gray-800 mb-2" />
              <Skeleton className="h-6 bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (isError || !stats) {
    toast({ title: "Error", description: "Could not load dashboard stats" });
    return (
      <>
        {statsConfig.map((item, i) => (
          <Card key={i} className="bg-black border-cyan-400">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">—</div>
              <div className="text-sm text-cyan-300">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      {statsConfig.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof Stats];

        return (
          <Card
            key={item.key}
            className="bg-black border-cyan-400 overflow-hidden shadow rounded-lg"
          >
            <CardContent className="p-6 text-center">
              <div className={`flex justify-center mb-2`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div
                className={`text-4xl font-bold text-cyan-400 mb-1`}
                data-testid={`stat-${item.key}`}
              >
                {value}
                {item.suffix || ""}
              </div>
              <div className="text-sm text-cyan-300">{item.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
