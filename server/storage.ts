import type { LoanApplication, InsertLoanApplication } from "@shared/schema";

export interface IStorage {
  getLoanApplications(): Promise<LoanApplication[]>;
  getLoanApplicationById(id: number): Promise<LoanApplication | undefined>;
  createLoanApplication(data: InsertLoanApplication): Promise<LoanApplication>;
}

export class MemStorage implements IStorage {
  private loanApplications: LoanApplication[] = [];
  private nextId = 1;

  async getLoanApplications(): Promise<LoanApplication[]> {
    return this.loanApplications;
  }

  async getLoanApplicationById(id: number): Promise<LoanApplication | undefined> {
    return this.loanApplications.find(app => app.id === id);
  }

  async createLoanApplication(data: InsertLoanApplication): Promise<LoanApplication> {
    const loanApplication: LoanApplication = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
    };
    this.loanApplications.push(loanApplication);
    return loanApplication;
  }
}

export const storage = new MemStorage();
