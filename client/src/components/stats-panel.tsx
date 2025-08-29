import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface StatsData {
  totalInQueue: number;
  priorityCounts: {
    critical: number;
    urgent: number;
    semiUrgent: number;
    standard: number;
    nonUrgent: number;
  };
  avgWaitTime: number;
  totalProcessed: number;
}

interface StatsPanelProps {
  stats?: StatsData;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-lg medical-card animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-6 w-8 bg-muted rounded"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="shadow-lg medical-card" data-testid="card-critical-cases">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-critical-count">
                {stats.priorityCounts.critical}
              </p>
              <p className="text-sm text-muted-foreground">Critical Cases</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg medical-card" data-testid="card-urgent-cases">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-urgent-count">
                {stats.priorityCounts.urgent}
              </p>
              <p className="text-sm text-muted-foreground">Urgent Cases</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg medical-card" data-testid="card-standard-cases">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-standard-count">
                {stats.priorityCounts.standard + stats.priorityCounts.semiUrgent + stats.priorityCounts.nonUrgent}
              </p>
              <p className="text-sm text-muted-foreground">Standard Cases</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg medical-card" data-testid="card-avg-wait">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-avg-wait-time">
                {stats.avgWaitTime.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Wait (min)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
