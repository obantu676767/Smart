import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  currentUsage: decimal("current_usage").notNull().default("0"),
});

export const energyReadings = pgTable("energy_readings", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  usage: decimal("usage").notNull(),
});

export const budgetAlerts = pgTable("budget_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  threshold: decimal("threshold").notNull(),
  isEnabled: boolean("is_enabled").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  name: true,
  type: true,
});

export const insertEnergyReadingSchema = createInsertSchema(energyReadings).pick({
  deviceId: true,
  usage: true,
});

export const insertBudgetAlertSchema = createInsertSchema(budgetAlerts).pick({
  threshold: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type EnergyReading = typeof energyReadings.$inferSelect;
export type BudgetAlert = typeof budgetAlerts.$inferSelect;
