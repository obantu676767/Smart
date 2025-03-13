import { InsertUser, User, Device, EnergyReading, BudgetAlert } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { devices, users, energyReadings, budgetAlerts } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;

  getEnergyReadings(deviceId: number): Promise<EnergyReading[]>;
  addEnergyReading(reading: EnergyReading): Promise<void>;

  getBudgetAlerts(userId: number): Promise<BudgetAlert[]>;
  setBudgetAlert(userId: number, threshold: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async getEnergyReadings(deviceId: number): Promise<EnergyReading[]> {
    return await db.select()
      .from(energyReadings)
      .where(eq(energyReadings.deviceId, deviceId));
  }

  async addEnergyReading(reading: EnergyReading): Promise<void> {
    await db.insert(energyReadings).values(reading);
  }

  async getBudgetAlerts(userId: number): Promise<BudgetAlert[]> {
    return await db.select()
      .from(budgetAlerts)
      .where(eq(budgetAlerts.userId, userId));
  }

  async setBudgetAlert(userId: number, threshold: number): Promise<void> {
    await db.insert(budgetAlerts).values({
      userId,
      threshold: threshold.toString(),
      isEnabled: true
    });
  }
}

export const storage = new DatabaseStorage();