import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  sex: integer("sex").notNull(), // 1 = female, 2 = male
  arrivalMode: integer("arrival_mode").notNull(),
  injury: integer("injury").notNull(), // 1 = no, 2 = yes
  mental: integer("mental").notNull(), // 1 = alert, 2 = verbal, 3 = pain, 4 = unresponsive
  pain: integer("pain").notNull(), // 0 = no, 1 = yes
  nrsPain: integer("nrs_pain").default(0), // 0-10
  sbp: integer("sbp").notNull(), // systolic blood pressure
  dbp: integer("dbp").notNull(), // diastolic blood pressure
  hr: integer("hr").notNull(), // heart rate
  rr: integer("rr").notNull(), // respiratory rate
  bt: real("bt").notNull(), // body temperature
  saturation: integer("saturation").notNull(), // oxygen saturation
  diagnosis: text("diagnosis").notNull(),
  triageLevel: integer("triage_level").notNull(), // 1-5 (1 = most critical)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("waiting").notNull(), // waiting, in_treatment, completed, removed
  assignedDoctorId: text("assigned_doctor_id"), // ID of assigned doctor
  originalTriageLevel: integer("original_triage_level").notNull(), // AI-generated triage level
  overriddenTriageLevel: integer("overridden_triage_level"), // Doctor-overridden triage level
  overriddenBy: text("overridden_by"), // Doctor who overrode the priority
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  timestamp: true,
  triageLevel: true,
  status: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
