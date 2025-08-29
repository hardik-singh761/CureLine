import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import PatientIntakeForm from "@/components/patient-intake-form";
import TriageQueue from "@/components/triage-queue";
import StatsPanel from "@/components/stats-panel";

export default function TriageDashboard() {
  const [currentTime, setCurrentTime] = useState("");

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch queue data with polling
  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ["/api/patients/queue"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch stats data with polling
  const { data: statsData } = useQuery({
    queryKey: ["/api/patients/stats"],
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-bg text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Triage System</h1>
                <p className="text-sm opacity-90">Emergency Department Management</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Current Time</p>
              <p className="font-semibold">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Intake Form */}
          <PatientIntakeForm onPatientAdded={() => refetchQueue()} />
          
          {/* Triage Queue */}
          <TriageQueue patients={queueData || []} />
        </div>

        {/* Statistics Panel */}
        <StatsPanel stats={statsData} />
      </div>
    </div>
  );
}
