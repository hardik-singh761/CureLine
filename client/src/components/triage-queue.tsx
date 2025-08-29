import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, X, Edit3, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface TriageQueueProps {
  patients: Patient[];
}

const priorityConfig = {
  1: { 
    label: 'CRITICAL', 
    color: 'bg-destructive text-destructive-foreground',
    borderColor: 'priority-1',
    pulseClass: 'animate-pulse'
  },
  2: { 
    label: 'URGENT', 
    color: 'bg-orange-500 text-white',
    borderColor: 'priority-2',
    pulseClass: ''
  },
  3: { 
    label: 'SEMI-URGENT', 
    color: 'bg-yellow-500 text-white',
    borderColor: 'priority-3',
    pulseClass: ''
  },
  4: { 
    label: 'STANDARD', 
    color: 'bg-secondary text-secondary-foreground',
    borderColor: 'priority-4',
    pulseClass: ''
  },
  5: { 
    label: 'NON-URGENT', 
    color: 'bg-muted-foreground text-white',
    borderColor: 'priority-5',
    pulseClass: ''
  },
};

export default function TriageQueue({ patients }: TriageQueueProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPriority, setEditingPriority] = useState<{[patientId: string]: number}>({});

  // Remove patient mutation
  const removePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const response = await apiRequest("DELETE", `/api/patients/${patientId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/stats"] });
      toast({
        title: "Patient Removed",
        description: "Patient has been removed from the queue",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove patient",
        variant: "destructive",
      });
    },
  });

  // Override priority mutation
  const overridePriorityMutation = useMutation({
    mutationFn: async ({ patientId, newPriority }: { patientId: string; newPriority: number }) => {
      const response = await apiRequest("PATCH", `/api/patients/${patientId}/priority`, {
        newPriority,
        doctorId: "emergency-override" // Placeholder doctor ID for emergency overrides
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/stats"] });
      setEditingPriority({});
      toast({
        title: "Priority Updated",
        description: "Patient priority has been overridden",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Priority Update Failed",
        description: error.message || "Failed to update priority",
        variant: "destructive",
      });
    },
  });

  const handleRemovePatient = (patientId: string) => {
    removePatientMutation.mutate(patientId);
  };

  const handlePriorityChange = (patientId: string, newPriority: string) => {
    setEditingPriority(prev => ({
      ...prev,
      [patientId]: parseInt(newPriority)
    }));
  };

  const handleSavePriority = (patientId: string) => {
    const newPriority = editingPriority[patientId];
    if (newPriority) {
      overridePriorityMutation.mutate({ patientId, newPriority });
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
    return `${minutes} min ago`;
  };

  const getCurrentPriority = (patient: Patient) => {
    return patient.overriddenTriageLevel ?? patient.triageLevel;
  };

  const isOverridden = (patient: Patient) => {
    return patient.overriddenTriageLevel !== null && patient.overriddenTriageLevel !== undefined;
  };

  return (
    <Card className="shadow-lg medical-card">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Triage Queue</CardTitle>
            <p className="text-muted-foreground mt-1">Real-time priority-based patient queue with management controls</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Patients Waiting</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-queue-count">
              {patients.length}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Priority Legend */}
      <div className="p-4 bg-muted/50 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold mb-3">Priority Levels</h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span>Level 1 - Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Level 2 - Urgent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Level 3 - Semi-urgent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span>Level 4 - Standard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                <span>Level 5 - Non-urgent</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold mb-3">Queue Controls</h4>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center"><Edit3 className="w-3 h-3 mr-1" />Override Priority</span>
              <span className="flex items-center"><X className="w-3 h-3 mr-1" />Remove Patient</span>
              <span className="text-blue-700">🔵 = Doctor Override</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {patients.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-queue-state">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Patients in Queue</h3>
            <p className="text-muted-foreground">Add patients using the intake form to populate the triage queue.</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="patient-queue-list">
            {patients.map((patient) => {
              const currentPriority = getCurrentPriority(patient);
              const priority = priorityConfig[currentPriority as keyof typeof priorityConfig];
              const isEditingThis = editingPriority[patient.id] !== undefined;
              const isPatientOverridden = isOverridden(patient);
              
              return (
                <div 
                  key={patient.id}
                  className={`${priority.borderColor} bg-card border border-border rounded-lg p-4 shadow-sm ${priority.pulseClass} ${isPatientOverridden ? 'ring-2 ring-blue-500/30' : ''}`}
                  data-testid={`patient-card-${patient.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${priority.color} rounded-full flex items-center justify-center font-bold text-sm`}>
                        {currentPriority}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-card-foreground" data-testid={`text-patient-name-${patient.id}`}>
                            {patient.name}
                          </h4>
                          {isPatientOverridden && (
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">
                              Override by {patient.overriddenBy}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`text-patient-symptoms-${patient.id}`}>
                          {patient.diagnosis}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            className={priority.color}
                            data-testid={`badge-priority-${patient.id}`}
                          >
                            {priority.label}
                          </Badge>
                          
                          {/* Priority Override Controls */}
                          {isEditingThis ? (
                            <div className="flex items-center space-x-1">
                              <Select
                                value={editingPriority[patient.id]?.toString() || currentPriority.toString()}
                                onValueChange={(value) => handlePriorityChange(patient.id, value)}
                              >
                                <SelectTrigger className="w-16 h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleSavePriority(patient.id)}
                                disabled={overridePriorityMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => setEditingPriority(prev => {
                                  const updated = {...prev};
                                  delete updated[patient.id];
                                  return updated;
                                })}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingPriority(prev => ({
                                ...prev,
                                [patient.id]: currentPriority
                              }))}
                              data-testid={`edit-priority-${patient.id}`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {/* Remove Patient Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                data-testid={`remove-patient-${patient.id}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Patient from Queue</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {patient.name} from the queue? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemovePatient(patient.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Patient
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        
                        <p className="text-xs text-muted-foreground flex items-center" data-testid={`text-time-ago-${patient.id}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(patient.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <span data-testid={`text-age-${patient.id}`}>Age: {patient.age}</span>
                    <span data-testid={`text-bp-${patient.id}`}>BP: {patient.sbp}/{patient.dbp}</span>
                    <span data-testid={`text-hr-${patient.id}`}>HR: {patient.hr}</span>
                    <span data-testid={`text-o2-${patient.id}`}>O₂: {patient.saturation}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}