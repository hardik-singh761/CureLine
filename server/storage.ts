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
  getQueuedPatients(): Promise<Patient[]>;
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
      nrsPain: patientData.nrsPain ?? 0
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

  async getQueuedPatients(): Promise<Patient[]> {
    const allPatients = Array.from(this.patients.values());
    return allPatients
      .filter(patient => patient.status === "waiting")
      .sort((a, b) => {
        // Sort by triage level first (lower number = higher priority)
        if (a.triageLevel !== b.triageLevel) {
          return a.triageLevel - b.triageLevel;
        }
        // Then by timestamp (earlier = higher priority)
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
  }
}

export const storage = new MemStorage();
