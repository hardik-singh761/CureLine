import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Users, Stethoscope } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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
            <div className="flex items-center space-x-4">
              <Link href="/doctors">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  data-testid="doctor-assignment-link"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Doctor Assignment
                </Button>
              </Link>
              <div className="text-right">
                <p className="text-sm opacity-90">Current Time</p>
                <p className="font-semibold">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Statistics Panel */}
        <StatsPanel stats={statsData} />
        
        {/* Patient Intake Form - Wider container */}
        <div className="mt-8 max-w-4xl mx-auto">
          <PatientIntakeForm onPatientAdded={() => refetchQueue()} />
        </div>

        {/* Triage Queue - Full width at bottom */}
        <div className="mt-8">
          <TriageQueue patients={queueData || []} />
        </div>
      </div>
      
      {/* Professional Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">AI Triage System</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced emergency department management system powered by artificial intelligence for optimal patient care and resource allocation.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Quick Access</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Patient Intake</p>
                <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Triage Queue</p>
                <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Statistics</p>
                <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Emergency Protocols</p>
              </div>
            </div>
            
            {/* Medical Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Medical Standards</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Emergency Medicine Guidelines</p>
                <p className="text-sm text-muted-foreground">HIPAA Compliant</p>
                <p className="text-sm text-muted-foreground">24/7 System Monitoring</p>
                <p className="text-sm text-muted-foreground">Clinical Decision Support</p>
              </div>
            </div>
            
            {/* Contact & Support */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Support</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Emergency: 911</p>
                <p className="text-sm text-muted-foreground">IT Support: ext. 2080</p>
                <p className="text-sm text-muted-foreground">System Admin: ext. 2090</p>
                <p className="text-sm text-muted-foreground">help@hospital.org</p>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AI Triage System. Advanced Emergency Department Management.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <p className="text-xs text-muted-foreground">Version 2.1.0</p>
              <p className="text-xs text-muted-foreground">Last Updated: August 2024</p>
              <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
