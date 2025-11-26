import type { Express } from "express";
import { storage } from "./storage";
import { insertLoanApplicationSchema } from "@shared/schema";

export function registerRoutes(app: Express): void {
  app.get("/api/loans", async (_req, res) => {
    try {
      const loans = await storage.getLoanApplications();
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loan applications" });
    }
  });

  app.get("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loan = await storage.getLoanApplicationById(id);
      if (!loan) {
        return res.status(404).json({ error: "Loan application not found" });
      }
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loan application" });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const validatedData = insertLoanApplicationSchema.parse(req.body);
      const loan = await storage.createLoanApplication(validatedData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create loan application" });
      }
    }
  });
}
