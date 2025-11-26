import { z } from "zod";

export interface LoanApplication {
  id: number;
  name: string;
  phone: string;
  idNumber: string;
  loanType: string;
  amount: number;
  fee: number;
  totalRepayment: number;
  createdAt: Date;
}

export const insertLoanApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  idNumber: z.string().min(1, "ID number is required"),
  loanType: z.string().min(1, "Loan type is required"),
  amount: z.number().positive("Loan amount must be positive"),
  fee: z.number().nonnegative("Fee must be non-negative"),
  totalRepayment: z.number().positive("Total repayment must be positive"),
});

export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type SelectLoanApplication = LoanApplication;

export interface LoanOption {
  amount: number;
  fee: number;
  totalRepayment: number;
}
