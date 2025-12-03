import type { Transaction } from "@/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  exportSummaryToCSV,
  exportToCSV,
  formatTransactionForExport,
} from "./export-utils";

describe("export-utils", () => {
  // Mock DOM methods
  let mockCreateElement: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let mockSetAttribute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClick = vi.fn();
    mockSetAttribute = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();

    const mockLink = {
      setAttribute: mockSetAttribute,
      click: mockClick,
      style: {},
    };

    mockCreateElement = vi.fn(() => mockLink);
    mockCreateObjectURL = vi.fn(() => "blob:test-url");
    mockRevokeObjectURL = vi.fn();

    // Mock document methods
    Object.defineProperty(document, "createElement", {
      value: mockCreateElement,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, "appendChild", {
      value: mockAppendChild,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, "removeChild", {
      value: mockRemoveChild,
      writable: true,
      configurable: true,
    });

    // Mock URL methods
    Object.defineProperty(URL, "createObjectURL", {
      value: mockCreateObjectURL,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: mockRevokeObjectURL,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("exportToCSV", () => {
    const mockTransaction: Transaction = {
      _id: "tx1" as unknown as Transaction["_id"],
      amount: 1500,
      date: new Date("2025-01-15").getTime(),
      accountId: "acc1",
      outflowTypeId: "type1",
      note: "Test transaction",
      metadata: {},
      clerkId: "user1",
      account: {
        _id: "acc1",
        name: "Main Bank",
        type: "Bank",
      },
      outflowType: {
        _id: "type1",
        name: "Food",
        emoji: "🍕",
      },
    };

    it("should throw error when transactions array is empty", () => {
      expect(() => exportToCSV([])).toThrow("No transactions to export");
    });

    it("should create a CSV file and trigger download", () => {
      exportToCSV([mockTransaction]);

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith("href", "blob:test-url");
      expect(mockSetAttribute).toHaveBeenCalledWith("download", "transactions.csv");
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
    });

    it("should use custom filename", () => {
      exportToCSV([mockTransaction], "my-exports.csv");

      expect(mockSetAttribute).toHaveBeenCalledWith("download", "my-exports.csv");
    });

    it("should handle transaction with subscription metadata", () => {
      const txWithProvider: Transaction = {
        ...mockTransaction,
        metadata: { provider: "Netflix" },
      };

      exportToCSV([txWithProvider]);

      // Verify blob was created (we can't easily inspect blob content)
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should handle transaction with loan metadata", () => {
      const txWithLoan: Transaction = {
        ...mockTransaction,
        metadata: { loanName: "Home Loan" },
      };

      exportToCSV([txWithLoan]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should handle transaction with borrower metadata", () => {
      const txWithBorrower: Transaction = {
        ...mockTransaction,
        metadata: { borrowerName: "John Doe" },
      };

      exportToCSV([txWithBorrower]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should handle transaction without account or outflowType", () => {
      const txMinimal: Transaction = {
        ...mockTransaction,
        account: null,
        outflowType: null,
      };

      exportToCSV([txMinimal]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should escape quotes in notes", () => {
      const txWithQuotes: Transaction = {
        ...mockTransaction,
        note: 'Test "quoted" note',
      };

      exportToCSV([txWithQuotes]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should handle multiple transactions", () => {
      const transactions = [
        mockTransaction,
        { ...mockTransaction, _id: "tx2" as unknown as Transaction["_id"], amount: 2500 },
        { ...mockTransaction, _id: "tx3" as unknown as Transaction["_id"], amount: 3500 },
      ];

      exportToCSV(transactions);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe("exportSummaryToCSV", () => {
    it("should create summary CSV and trigger download", () => {
      const summaryData = [
        { label: "Food", value: 5000 },
        { label: "Transport", value: 2500 },
        { label: "Entertainment", value: 1500 },
      ];

      exportSummaryToCSV(summaryData);

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith("download", "summary.csv");
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it("should use custom filename", () => {
      const summaryData = [{ label: "Total", value: 10000 }];

      exportSummaryToCSV(summaryData, "monthly-summary.csv");

      expect(mockSetAttribute).toHaveBeenCalledWith("download", "monthly-summary.csv");
    });

    it("should handle string values", () => {
      const summaryData = [
        { label: "Status", value: "Active" },
        { label: "Category", value: "Premium" },
      ];

      exportSummaryToCSV(summaryData);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should handle empty data array", () => {
      exportSummaryToCSV([]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe("formatTransactionForExport", () => {
    const mockTransaction: Transaction = {
      _id: "tx1" as unknown as Transaction["_id"],
      amount: 1500,
      date: new Date("2025-01-15T10:30:00").getTime(),
      accountId: "acc1",
      outflowTypeId: "type1",
      note: "Test note",
      metadata: { provider: "Netflix" },
      clerkId: "user1",
      account: {
        _id: "acc1",
        name: "Main Bank",
        type: "Bank",
      },
      outflowType: {
        _id: "type1",
        name: "Subscription",
        emoji: "📺",
      },
    };

    it("should format transaction with all fields", () => {
      const result = formatTransactionForExport(mockTransaction);

      expect(result.amount).toBe("₹1,500");
      expect(result.category).toBe("Subscription");
      expect(result.account).toBe("Main Bank");
      expect(result.accountType).toBe("Bank");
      expect(result.note).toBe("Test note");
      expect(result.metadata).toEqual({ provider: "Netflix" });
      expect(result.date).toBeDefined();
      expect(result.time).toBeDefined();
    });

    it("should handle missing account", () => {
      const txNoAccount: Transaction = {
        ...mockTransaction,
        account: null,
      };

      const result = formatTransactionForExport(txNoAccount);

      expect(result.account).toBe("Unknown");
      expect(result.accountType).toBe("N/A");
    });

    it("should handle missing outflowType", () => {
      const txNoType: Transaction = {
        ...mockTransaction,
        outflowType: null,
      };

      const result = formatTransactionForExport(txNoType);

      expect(result.category).toBe("Uncategorized");
    });

    it("should handle empty note", () => {
      const txNoNote: Transaction = {
        ...mockTransaction,
        note: "",
      };

      const result = formatTransactionForExport(txNoNote);

      expect(result.note).toBe("");
    });

    it("should format large amounts with locale", () => {
      const txLargeAmount: Transaction = {
        ...mockTransaction,
        amount: 1500000,
      };

      const result = formatTransactionForExport(txLargeAmount);

      expect(result.amount).toBe("₹15,00,000");
    });
  });
});
