import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPatientSchema } from "@shared/schema";
import type { InsertPatient } from "@shared/schema";

interface PatientIntakeFormProps {
  onPatientAdded: () => void;
}

export default function PatientIntakeForm({ onPatientAdded }: PatientIntakeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      name: "",
      age: 0,
      sex: 0,
      arrivalMode: 0,
      injury: 0,
      mental: 0,
      pain: 0,
      nrsPain: 0,
      sbp: 0,
      dbp: 0,
      hr: 0,
      rr: 0,
      bt: 0,
      saturation: 0,
      diagnosis: "",
    },
  });

  const addPatientMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      const response = await apiRequest("POST", "/api/patients/triage", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/stats"] });
      toast({
        title: "Patient Added Successfully",
        description: `${data.patient.name} has been added to the triage queue with Priority Level ${data.triageLevel}`,
      });
      form.reset();
      onPatientAdded();
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Patient",
        description: error.message || "Failed to add patient to triage queue",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPatient) => {
    addPatientMutation.mutate(data);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-2xl font-bold">Patient Intake</CardTitle>
        <p className="text-muted-foreground">Enter patient information for AI triage assessment</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter full name"
                          data-testid="input-patient-name"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="0"
                          max="120"
                          placeholder="Enter age"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-age"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sex">
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Female</SelectItem>
                          <SelectItem value="2">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="arrivalMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Mode</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-arrival-mode">
                            <SelectValue placeholder="Select arrival mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Walking</SelectItem>
                          <SelectItem value="2">Public Ambulance</SelectItem>
                          <SelectItem value="3">Private Vehicle</SelectItem>
                          <SelectItem value="4">Private Ambulance</SelectItem>
                          <SelectItem value="5">Other (Air Transport)</SelectItem>
                          <SelectItem value="6">Other (Transfer)</SelectItem>
                          <SelectItem value="7">Other (Unknown)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Clinical Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Clinical Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="injury"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Present</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-injury">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">No</SelectItem>
                          <SelectItem value="2">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mental"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental Status</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-mental-status">
                            <SelectValue placeholder="Select mental status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Alert</SelectItem>
                          <SelectItem value="2">Verbal Response</SelectItem>
                          <SelectItem value="3">Pain Response</SelectItem>
                          <SelectItem value="4">Unresponsive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Present</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pain">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nrsPain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Scale (NRS)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pain-scale">
                            <SelectValue placeholder="Select pain level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0 - No Pain</SelectItem>
                          <SelectItem value="1">1 - Minimal</SelectItem>
                          <SelectItem value="2">2 - Mild</SelectItem>
                          <SelectItem value="3">3 - Mild</SelectItem>
                          <SelectItem value="4">4 - Moderate</SelectItem>
                          <SelectItem value="5">5 - Moderate</SelectItem>
                          <SelectItem value="6">6 - Moderate</SelectItem>
                          <SelectItem value="7">7 - Severe</SelectItem>
                          <SelectItem value="8">8 - Severe</SelectItem>
                          <SelectItem value="9">9 - Severe</SelectItem>
                          <SelectItem value="10">10 - Worst Possible</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vital Signs</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SBP (mmHg)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="40"
                          max="300"
                          placeholder="120"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-sbp"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBP (mmHg)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="20"
                          max="200"
                          placeholder="80"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-dbp"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HR (bpm)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="30"
                          max="200"
                          placeholder="72"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-hr"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RR (/min)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="5"
                          max="50"
                          placeholder="16"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-rr"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BT (°C)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.1"
                          min="30"
                          max="45"
                          placeholder="36.5"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-bt"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="saturation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O₂ Sat (%)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="70"
                          max="100"
                          placeholder="98"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-saturation"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Clinical Information</h3>
              
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis in ED</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        rows={3}
                        placeholder="Enter chief complaint, symptoms, and preliminary diagnosis..."
                        data-testid="textarea-diagnosis"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              disabled={addPatientMutation.isPending}
              data-testid="button-submit-patient"
            >
              <Plus className="w-5 h-5 mr-2" />
              {addPatientMutation.isPending ? "Processing..." : "Add to Triage Queue"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
