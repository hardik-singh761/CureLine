import { type User, type InsertUser, type Patient, type InsertPatient } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient methods
  createPatient(patient: InsertPatient & { triageLevel: number }): Promise<Patient>;
  getAllPatients(): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient | undefined>;
  updatePatientStatus(id: string, status: string): Promise<Patient | undefined>;
  removePatient(id: string): Promise<boolean>;
  assignPatientToDoctor(id: string, doctorId: string, status: string): Promise<Patient | undefined>;
  overridePatientPriority(id: string, newPriority: number, doctorId: string): Promise<Patient | undefined>;
  getBusyDoctors(): Promise<string[]>;
  getQueuedPatients(): Promise<Patient[]>;
  getPatientStats(): Promise<{
    totalInQueue: number;
    priorityCounts: Record<string, number>;
    averageWaitTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patients: Map<string, Patient>;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPatient(patientData: InsertPatient & { triageLevel: number }): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = {
      ...patientData,
      id,
      timestamp: new Date(),
      status: "waiting",
      nrsPain: patientData.nrsPain ?? 0,
      assignedDoctorId: null,
      originalTriageLevel: patientData.triageLevel,
      overriddenTriageLevel: null,
      overriddenBy: null
    };
    this.patients.set(id, patient);
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async updatePatientStatus(id: string, status: string): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (patient) {
      patient.status = status;
      this.patients.set(id, patient);
      return patient;
    }
    return undefined;
  }

  async assignPatientToDoctor(id: string, doctorId: string, status: string): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (patient) {
      patient.assignedDoctorId = doctorId;
      patient.status = status;
      this.patients.set(id, patient);
      return patient;
    }
    return undefined;
  }

  async removePatient(id: string): Promise<boolean> {
    return this.patients.delete(id);
  }

  async overridePatientPriority(id: string, newPriority: number, doctorId: string): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (patient) {
      patient.overriddenTriageLevel = newPriority;
      patient.overriddenBy = doctorId;
      this.patients.set(id, patient);
      return patient;
    }
    return undefined;
  }

  async getBusyDoctors(): Promise<string[]> {
    return Array.from(this.patients.values())
      .filter(p => p.status === "in_treatment" && p.assignedDoctorId)
      .map(p => p.assignedDoctorId!)
      .filter((doctorId, index, array) => array.indexOf(doctorId) === index); // Remove duplicates
  }

  async getQueuedPatients(): Promise<Patient[]> {
    const allPatients = Array.from(this.patients.values());
    return allPatients
      .filter(patient => patient.status === "waiting")
      .sort((a, b) => {
        // Use overridden priority if available, otherwise use original
        const aPriority = a.overriddenTriageLevel ?? a.triageLevel;
        const bPriority = b.overriddenTriageLevel ?? b.triageLevel;
        
        // Sort by priority level first (lower number = higher priority)
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        // Then by timestamp (earlier = higher priority)
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
  }

  async getPatientStats(): Promise<{
    totalInQueue: number;
    priorityCounts: Record<string, number>;
    averageWaitTime: number;
  }> {
    const queuedPatients = await this.getQueuedPatients();
    const now = Date.now();
    
    const priorityCounts = queuedPatients.reduce((acc, patient) => {
      const level = (patient.overriddenTriageLevel ?? patient.triageLevel).toString();
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalWaitTime = queuedPatients.reduce((sum, patient) => {
      return sum + (now - new Date(patient.timestamp).getTime());
    }, 0);

    const averageWaitTime = queuedPatients.length > 0 ? totalWaitTime / queuedPatients.length / (1000 * 60) : 0; // in minutes

    return {
      totalInQueue: queuedPatients.length,
      priorityCounts,
      averageWaitTime: Math.round(averageWaitTime)
    };
  }
}

export const storage = new MemStorage();
