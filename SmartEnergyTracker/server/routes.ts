import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Device routes
  app.get("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const devices = await storage.getDevices();
    res.json(devices);
  });

  app.get("/api/devices/:id/readings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const deviceId = parseInt(req.params.id);
    const readings = await storage.getEnergyReadings(deviceId);
    res.json(readings);
  });

  // Budget alert routes
  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const alerts = await storage.getBudgetAlerts(req.user.id);
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { threshold } = req.body;
    await storage.setBudgetAlert(req.user.id, threshold);
    res.sendStatus(201);
  });

  const httpServer = createServer(app);
  return httpServer;
}
