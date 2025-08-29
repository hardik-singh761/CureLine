import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mlService } from "./ml-service";
import { insertPatientSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all patients in queue (sorted by priority)
  app.get("/api/patients/queue", async (_req, res) => {
    try {
      const queuedPatients = await storage.getQueuedPatients();
      res.json(queuedPatients);
    } catch (error) {
      console.error("Error fetching queue:", error);
      res.status(500).json({ error: "Failed to fetch patient queue" });
    }
  });

  // Get queue statistics  
  app.get("/api/patients/stats", async (_req, res) => {
    try {
      const stats = await storage.getPatientStats();
      const allPatients = await storage.getAllPatients();
      
      const priorityCounts = {
        critical: stats.priorityCounts['1'] || 0,
        urgent: stats.priorityCounts['2'] || 0,
        semiUrgent: stats.priorityCounts['3'] || 0,
        standard: stats.priorityCounts['4'] || 0,
        nonUrgent: stats.priorityCounts['5'] || 0,
      };

      res.json({
        totalInQueue: stats.totalInQueue,
        priorityCounts,
        avgWaitTime: stats.averageWaitTime,
        totalProcessed: allPatients.length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get busy doctors
  app.get("/api/doctors/busy", async (_req, res) => {
    try {
      const busyDoctors = await storage.getBusyDoctors();
      res.json(busyDoctors);
    } catch (error) {
      console.error("Error fetching busy doctors:", error);
      res.status(500).json({ error: "Failed to fetch busy doctors" });
    }
  });

  // Submit new patient for triage
  app.post("/api/patients/triage", async (req, res) => {
    try {
      // Validate input data
      const validatedData = insertPatientSchema.parse(req.body);
      
      // Predict triage level using ML service
      const triageLevel = await mlService.predictTriageLevel({
        sex: validatedData.sex,
        age: validatedData.age,
        arrivalMode: validatedData.arrivalMode,
        injury: validatedData.injury,
        mental: validatedData.mental,
        pain: validatedData.pain,
        nrsPain: validatedData.nrsPain ?? 0,
        sbp: validatedData.sbp,
        dbp: validatedData.dbp,
        hr: validatedData.hr,
        rr: validatedData.rr,
        bt: validatedData.bt,
        saturation: validatedData.saturation,
        diagnosis: validatedData.diagnosis
      });

      // Create patient record with predicted triage level
      const patient = await storage.createPatient({
        ...validatedData,
        triageLevel
      });

      res.json({
        patient,
        triageLevel,
        message: "Patient successfully added to triage queue"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid patient data", 
          details: error.errors 
        });
      } else {
        console.error("Error creating patient:", error);
        res.status(500).json({ error: "Failed to process patient data" });
      }
    }
  });

  // Update patient status (for marking as in treatment, completed, etc.)
  app.patch("/api/patients/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["waiting", "in_treatment", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const updatedPatient = await storage.updatePatientStatus(id, status);
      
      if (!updatedPatient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      res.json(updatedPatient);
    } catch (error) {
      console.error("Error updating patient status:", error);
      res.status(500).json({ error: "Failed to update patient status" });
    }
  });

  // Assign patient to doctor and update status
  app.patch("/api/patients/:id/assign", async (req, res) => {
    try {
      const { id } = req.params;
      const { doctorId, status } = req.body;
      
      if (!doctorId) {
        return res.status(400).json({ error: "Doctor ID is required" });
      }
      
      if (!["waiting", "in_treatment", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const updatedPatient = await storage.assignPatientToDoctor(id, doctorId, status);
      
      if (!updatedPatient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      res.json(updatedPatient);
    } catch (error) {
      console.error("Error assigning patient to doctor:", error);
      res.status(500).json({ error: "Failed to assign patient to doctor" });
    }
  });

  // Remove patient from queue
  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const removed = await storage.removePatient(id);
      
      if (!removed) {
        return res.status(404).json({ error: "Patient not found" });
      }

      res.json({ success: true, message: "Patient removed successfully" });
    } catch (error) {
      console.error("Error removing patient:", error);
      res.status(500).json({ error: "Failed to remove patient" });
    }
  });

  // Override patient priority
  app.patch("/api/patients/:id/priority", async (req, res) => {
    try {
      const { id } = req.params;
      const { newPriority, doctorId } = req.body;
      
      if (!newPriority || !doctorId) {
        return res.status(400).json({ error: "New priority and doctor ID are required" });
      }
      
      if (newPriority < 1 || newPriority > 5) {
        return res.status(400).json({ error: "Priority must be between 1 and 5" });
      }

      const updatedPatient = await storage.overridePatientPriority(id, newPriority, doctorId);
      
      if (!updatedPatient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      res.json(updatedPatient);
    } catch (error) {
      console.error("Error overriding patient priority:", error);
      res.status(500).json({ error: "Failed to override patient priority" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
