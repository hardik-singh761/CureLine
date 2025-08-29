import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
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
  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
    return `${minutes} min ago`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Triage Queue</CardTitle>
            <p className="text-muted-foreground mt-1">Real-time priority-based patient queue</p>
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
              const priority = priorityConfig[patient.triageLevel as keyof typeof priorityConfig];
              
              return (
                <div 
                  key={patient.id}
                  className={`${priority.borderColor} bg-card border border-border rounded-lg p-4 shadow-sm ${priority.pulseClass}`}
                  data-testid={`patient-card-${patient.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${priority.color} rounded-full flex items-center justify-center font-bold text-sm`}>
                        {patient.triageLevel}
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground" data-testid={`text-patient-name-${patient.id}`}>
                          {patient.name}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-patient-symptoms-${patient.id}`}>
                          {patient.diagnosis}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={priority.color}
                        data-testid={`badge-priority-${patient.id}`}
                      >
                        {priority.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-time-ago-${patient.id}`}>
                        {getTimeAgo(patient.timestamp)}
                      </p>
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
