import type { Transaction } from "@/types";

/**
 * Export transactions to CSV format
 */
export function exportToCSV(
  transactions: Transaction[],
  filename = "transactions.csv"
) {
  if (transactions.length === 0) {
    throw new Error("No transactions to export");
  }

  // CSV headers
  const headers = [
    "Date",
    "Amount",
    "Category",
    "Account",
    "Account Type",
    "Note",
    "Provider/Details",
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((t) => {
    const date = new Date(t.date).toLocaleDateString();
    const amount = t.amount.toString();
    const category = t.outflowType?.name || "Uncategorized";
    const account = t.account?.name || "Unknown";
    const accountType = t.account?.type || "N/A";
    const note = t.note || "";

    // Extract relevant metadata
    let details = "";
    if (t.metadata) {
      if ("provider" in t.metadata) details = t.metadata.provider as string;
      else if ("borrowerName" in t.metadata)
        details = t.metadata.borrowerName as string;
      else if ("loanName" in t.metadata)
        details = t.metadata.loanName as string;
    }

    return [
      `"${date}"`,
      `"${amount}"`,
      `"${category}"`,
      `"${account}"`,
      `"${accountType}"`,
      `"${note.replace(/"/g, '""')}"`, // Escape quotes
      `"${details}"`,
    ].join(",");
  });

  // Combine headers and rows
  const csv = [headers.join(","), ...rows].join("\n");

  // Create and trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export transactions summary data to CSV
 */
export function exportSummaryToCSV(
  data: { label: string; value: number | string }[],
  filename = "summary.csv"
) {
  const headers = ["Category", "Value"];
  const rows = data.map((item) =>
    [`"${item.label}"`, `"${item.value}"`].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Format transaction data for display/export
 */
export function formatTransactionForExport(transaction: Transaction) {
  return {
    date: new Date(transaction.date).toLocaleDateString(),
    time: new Date(transaction.date).toLocaleTimeString(),
    amount: `₹${transaction.amount.toLocaleString()}`,
    category: transaction.outflowType?.name || "Uncategorized",
    account: transaction.account?.name || "Unknown",
    accountType: transaction.account?.type || "N/A",
    note: transaction.note || "",
    metadata: transaction.metadata,
  };
}
