import type { Id } from "@convex/_generated/dataModel";
import { z } from "zod";

// User types
export interface User {
  _id: string;
  uid: string;
  email: string;
  preferences: {
    currency: string;
    language: string;
    darkMode: boolean;
    onboardingCompleted: boolean;
  };
}

// Account types
export type AccountType =
  | "Cash"
  | "Bank"
  | "Credit Card"
  | "UPI"
  | "Loan"
  | "Wallet"
  | "Other";

export interface Account {
  _id: string;
  name: string;
  type: AccountType;
  colorHex: string;
  totalSpent?: number;
  userId: string;
  isArchived: boolean;
}

// Outflow type
export interface ExtraField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "toggle";
}

export interface OutflowType {
  _id: string;
  name: string;
  emoji: string;
  colorHex: string;
  isCustom: boolean;
  extraFields: ExtraField[];
  userId: string;
}

// Transaction metadata schemas
export const subscriptionMetadataSchema = z.object({
  provider: z.string(),
  renewalDate: z.number(),
  remind: z.boolean(),
  frequency: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
});

export const loanMetadataSchema = z.object({
  loanName: z.string(),
  emiAmount: z.number(),
  interestRate: z.number().optional(),
});

export const creditCardMetadataSchema = z.object({
  statementDate: z.number().optional(),
  minDue: z.number().optional(),
});

export const moneyLentMetadataSchema = z.object({
  borrowerName: z.string(),
  dueDate: z.number(),
  interestRate: z.number().optional(),
});

export type SubscriptionMetadata = z.infer<typeof subscriptionMetadataSchema>;
export type LoanMetadata = z.infer<typeof loanMetadataSchema>;
export type CreditCardMetadata = z.infer<typeof creditCardMetadataSchema>;
export type MoneyLentMetadata = z.infer<typeof moneyLentMetadataSchema>;

export type TransactionMetadata =
  | SubscriptionMetadata
  | LoanMetadata
  | CreditCardMetadata
  | MoneyLentMetadata
  | Record<string, unknown>; // For custom types

export interface Transaction {
  _id: Id<"transactions">;
  amount: number;
  date: number;
  accountId: string;
  outflowTypeId: string;
  note: string;
  receiptImageId?: string;
  metadata: TransactionMetadata;
  userId: string;
  account?: {
    _id: string;
    name: string;
    type: AccountType;
  } | null;
  outflowType?: {
    _id: string;
    name: string;
    emoji: string;
  } | null;
}

// Budget
export interface Budget {
  _id: string;
  outflowTypeId: string;
  amount: number;
  month: string; // YYYY-MM
  userId: string;
}

// Notification
export type NotificationType = "renewal" | "due";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  transactionId: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

// Form schemas
export const transactionFormSchema = z.object({
  amount: z.number().positive(),
  date: z.date(),
  accountId: z.string(),
  outflowTypeId: z.string(),
  note: z.string(),
  receiptImageId: z.string().optional(),
  metadata: z.record(z.string(), z.any()),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

// Utility types
export interface MonthlySummary {
  totalSpent: number;
  topTypes: { outflowTypeId: string; amount: number }[];
}

export interface BudgetProgress {
  budgetId: string;
  outflowTypeId: string;
  budgeted: number;
  spent: number;
  progress: number;
}
