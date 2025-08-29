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
      const allPatients = await storage.getAllPatients();
      const queuedPatients = await storage.getQueuedPatients();
      
      const priorityCounts = {
        critical: queuedPatients.filter(p => p.triageLevel === 1).length,
        urgent: queuedPatients.filter(p => p.triageLevel === 2).length,
        semiUrgent: queuedPatients.filter(p => p.triageLevel === 3).length,
        standard: queuedPatients.filter(p => p.triageLevel === 4).length,
        nonUrgent: queuedPatients.filter(p => p.triageLevel === 5).length,
      };

      // Calculate average wait time (approximate)
      const avgWaitTime = queuedPatients.length > 0 
        ? Math.round(queuedPatients.reduce((sum, patient) => {
            const waitMinutes = (Date.now() - patient.timestamp.getTime()) / (1000 * 60);
            return sum + waitMinutes;
          }, 0) / queuedPatients.length)
        : 0;

      res.json({
        totalInQueue: queuedPatients.length,
        priorityCounts,
        avgWaitTime,
        totalProcessed: allPatients.length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
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
        nrsPain: validatedData.nrsPain,
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

  const httpServer = createServer(app);
  return httpServer;
}
