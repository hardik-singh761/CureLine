import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Stethoscope, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

// Doctor data with medical specialties
const doctors = [
  {
    id: "dr-smith",
    name: "Dr. Sarah Smith",
    specialty: "Emergency Medicine",
    department: "Emergency Department",
    conditions: ["trauma", "cardiac", "respiratory", "emergency", "accident", "severe pain"],
    avatar: "SS",
    status: "available"
  },
  {
    id: "dr-johnson",
    name: "Dr. Michael Johnson", 
    specialty: "Cardiology",
    department: "Cardiology",
    conditions: ["chest pain", "cardiac", "heart", "blood pressure", "hypertension", "cardiovascular"],
    avatar: "MJ",
    status: "available"
  },
  {
    id: "dr-williams",
    name: "Dr. Emily Williams",
    specialty: "Internal Medicine",
    department: "Internal Medicine", 
    conditions: ["fever", "infection", "diabetes", "internal", "general medicine", "chronic"],
    avatar: "EW",
    status: "available"
  },
  {
    id: "dr-brown",
    name: "Dr. Robert Brown",
    specialty: "Orthopedics",
    department: "Orthopedics",
    conditions: ["fracture", "bone", "joint", "injury", "orthopedic", "sprain", "muscle"],
    avatar: "RB",
    status: "available"
  },
  {
    id: "dr-davis",
    name: "Dr. Lisa Davis",
    specialty: "Neurology", 
    department: "Neurology",
    conditions: ["headache", "stroke", "neurological", "seizure", "brain", "nerve"],
    avatar: "LD",
    status: "available"
  },
  {
    id: "dr-miller",
    name: "Dr. James Miller",
    specialty: "Pulmonology",
    department: "Pulmonology",
    conditions: ["breathing", "respiratory", "lung", "asthma", "pneumonia", "cough"],
    avatar: "JM",
    status: "available"
  }
];

const priorityConfig = {
  1: { label: 'CRITICAL', color: 'bg-destructive text-destructive-foreground' },
  2: { label: 'URGENT', color: 'bg-orange-500 text-white' },
  3: { label: 'SEMI-URGENT', color: 'bg-yellow-500 text-white' },
  4: { label: 'STANDARD', color: 'bg-secondary text-secondary-foreground' },
  5: { label: 'NON-URGENT', color: 'bg-muted-foreground text-white' },
};

export default function DoctorAssignment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignments, setSelectedAssignments] = useState<{[patientId: string]: string}>({});

  // Fetch patients in queue
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["/api/patients/queue"],
    refetchInterval: 5000,
  });

  // Fetch busy doctors
  const { data: busyDoctors = [] } = useQuery<string[]>({
    queryKey: ["/api/doctors/busy"],
    refetchInterval: 5000,
  });

  // Assign patient to doctor mutation
  const assignPatientMutation = useMutation({
    mutationFn: async ({ patientId, doctorId }: { patientId: string; doctorId: string }) => {
      const response = await apiRequest("PATCH", `/api/patients/${patientId}/assign`, { 
        doctorId,
        status: "in_treatment" 
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const doctor = doctors.find(d => d.id === variables.doctorId);
      queryClient.invalidateQueries({ queryKey: ["/api/patients/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/stats"] });
      toast({
        title: "Patient Assigned Successfully",
        description: `Patient has been assigned to ${doctor?.name} and removed from queue`,
      });
      // Clear the selection for this patient
      setSelectedAssignments(prev => {
        const updated = {...prev};
        delete updated[variables.patientId];
        return updated;
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign patient to doctor",
        variant: "destructive",
      });
    },
  });

  const handleDoctorSelect = (patientId: string, doctorId: string) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [patientId]: doctorId
    }));
  };

  const handleAssignPatient = (patientId: string) => {
    const doctorId = selectedAssignments[patientId];
    if (doctorId) {
      assignPatientMutation.mutate({ patientId, doctorId });
    }
  };

  const getRecommendedDoctors = (diagnosis: string) => {
    const lowerDiagnosis = diagnosis.toLowerCase();
    return doctors.filter(doctor => {
      // Filter out busy doctors
      const isBusy = busyDoctors.includes(doctor.id);
      
      // Check if doctor specializes in the condition
      const isSpecialist = doctor.conditions.some(condition => 
        lowerDiagnosis.includes(condition)
      );
      
      return isSpecialist && !isBusy;
    });
  };

  const getAvailableDoctors = () => {
    return doctors.filter(doctor => !busyDoctors.includes(doctor.id));
  };

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
    return `${minutes} min ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Doctor Assignment</h1>
              <p className="text-muted-foreground">Assign patients to appropriate doctors based on their medical conditions</p>
            </div>
            <Link href="/">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                data-testid="back-to-dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Available Doctors Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {doctors.map((doctor) => {
            const isBusy = busyDoctors.includes(doctor.id);
            return (
              <Card key={doctor.id} className={`medical-card ${isBusy ? 'opacity-60' : ''}`} data-testid={`doctor-card-${doctor.id}`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${isBusy ? 'bg-red-100' : 'bg-primary/10'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className={`${isBusy ? 'text-red-600' : 'text-primary'} font-semibold text-sm`}>{doctor.avatar}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1" data-testid={`doctor-name-${doctor.id}`}>
                    {doctor.name.split(' ').slice(1).join(' ')}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-1">{doctor.specialty}</p>
                  <Badge variant={isBusy ? "destructive" : "outline"} className="text-xs">
                    {isBusy ? "Busy" : "Available"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Patient Assignment List */}
        <Card className="medical-card">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Patient Queue - Doctor Assignment
                </CardTitle>
                <p className="text-muted-foreground mt-1">Assign patients to doctors and manage treatment flow</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Patients Waiting</p>
                <p className="text-2xl font-bold text-primary" data-testid="queue-count">
                  {queueData?.length || 0}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {!queueData || queueData.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-assignment-queue">
                <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Patients in Queue</h3>
                <p className="text-muted-foreground">All patients have been assigned to doctors or the queue is empty.</p>
              </div>
            ) : (
              <div className="space-y-6" data-testid="assignment-list">
                {queueData.map((patient: Patient) => {
                  const priority = priorityConfig[patient.triageLevel as keyof typeof priorityConfig];
                  const recommendedDoctors = getRecommendedDoctors(patient.diagnosis);
                  const selectedDoctor = selectedAssignments[patient.id];
                  
                  return (
                    <div 
                      key={patient.id}
                      className="border border-border rounded-lg p-6 space-y-4 bg-card"
                      data-testid={`assignment-patient-${patient.id}`}
                    >
                      {/* Patient Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${priority.color} rounded-full flex items-center justify-center font-bold`}>
                            {patient.triageLevel}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold" data-testid={`patient-name-${patient.id}`}>
                              {patient.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Age: {patient.age} • Waiting: {getTimeAgo(patient.timestamp)}
                            </p>
                            <Badge className={priority.color} data-testid={`priority-badge-${patient.id}`}>
                              {priority.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <span>BP: {patient.sbp}/{patient.dbp}</span>
                            <span>HR: {patient.hr}</span>
                            <span>O₂: {patient.saturation}%</span>
                            <span>Temp: {patient.bt}°C</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-1">Chief Complaint & Diagnosis</h4>
                        <p className="text-sm text-muted-foreground" data-testid={`diagnosis-${patient.id}`}>
                          {patient.diagnosis}
                        </p>
                      </div>

                      {/* Doctor Assignment */}
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-2 block">Assign to Doctor</label>
                          <Select 
                            value={selectedDoctor || ""} 
                            onValueChange={(value) => handleDoctorSelect(patient.id, value)}
                            data-testid={`doctor-select-${patient.id}`}
                          >
                            <SelectTrigger className="medical-input">
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                              {recommendedDoctors.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                    Recommended Based on Condition
                                  </div>
                                  {recommendedDoctors.map((doctor) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium">{doctor.name}</span>
                                        <span className="text-xs text-muted-foreground">({doctor.specialty})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                  <div className="border-t my-1"></div>
                                </>
                              )}
                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                All Available Doctors
                              </div>
                              {getAvailableDoctors().map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{doctor.name}</span>
                                    <span className="text-xs text-muted-foreground">({doctor.specialty})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button
                          onClick={() => handleAssignPatient(patient.id)}
                          disabled={!selectedDoctor || assignPatientMutation.isPending}
                          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-6 shadow-lg transition-all duration-200"
                          data-testid={`assign-button-${patient.id}`}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          {assignPatientMutation.isPending ? "Assigning..." : "Assign & Remove from Queue"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}