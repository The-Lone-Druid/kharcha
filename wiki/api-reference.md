# API Reference

This document describes the Convex backend API functions used by Kharcha. All functions require authentication unless otherwise noted.

---

## Overview

Kharcha uses [Convex](https://convex.dev/) as its backend. All API calls are made through Convex's real-time query and mutation system.

### API Types

| Type | Description |
|------|-------------|
| **Query** | Read-only operations that automatically update when data changes |
| **Mutation** | Write operations that modify data |

---

## Users API

### `users.getCurrentUser`

**Type:** Query

Gets the currently authenticated user's profile.

**Returns:**
```typescript
{
  _id: Id<"users">,
  clerkId: string,
  name: string,
  email: string,
  imageUrl?: string
}
```

### `users.createOrUpdateUser`

**Type:** Mutation

Creates a new user or updates an existing one (called on authentication).

**Arguments:**
```typescript
{
  clerkId: string,
  name: string,
  email: string,
  imageUrl?: string
}
```

---

## Accounts API

### `accounts.listAccounts`

**Type:** Query

Lists all accounts for the current user.

**Returns:**
```typescript
Array<{
  _id: Id<"accounts">,
  name: string,
  type: "Cash" | "Bank" | "Credit Card" | "UPI" | "Loan" | "Wallet" | "Other",
  colorHex: string,
  isArchived: boolean
}>
```

### `accounts.getAccountWithBalance`

**Type:** Query

Gets a specific account with its calculated balance.

**Arguments:**
```typescript
{
  id: Id<"accounts">
}
```

**Returns:**
```typescript
{
  _id: Id<"accounts">,
  name: string,
  type: string,
  colorHex: string,
  isArchived: boolean,
  balance: number  // Calculated from transactions
}
```

### `accounts.createAccount`

**Type:** Mutation

Creates a new account.

**Arguments:**
```typescript
{
  name: string,
  type: "Cash" | "Bank" | "Credit Card" | "UPI" | "Loan" | "Wallet" | "Other",
  colorHex: string
}
```

### `accounts.updateAccount`

**Type:** Mutation

Updates an existing account.

**Arguments:**
```typescript
{
  id: Id<"accounts">,
  name?: string,
  type?: "Cash" | "Bank" | "Credit Card" | "UPI" | "Loan" | "Wallet" | "Other",
  colorHex?: string,
  isArchived?: boolean
}
```

### `accounts.deleteAccount`

**Type:** Mutation

Deletes an account. Will fail if the account has transactions.

**Arguments:**
```typescript
{
  id: Id<"accounts">
}
```

---

## Transactions API

### `transactions.listTransactions`

**Type:** Query

Lists transactions for the current user with optional filtering.

**Arguments:**
```typescript
{
  limit?: number,           // Default: 50
  accountId?: Id<"accounts">,
  outflowTypeId?: Id<"outflowTypes">,
  startDate?: number,       // Timestamp
  endDate?: number          // Timestamp
}
```

**Returns:**
```typescript
Array<{
  _id: Id<"transactions">,
  amount: number,
  date: number,
  note: string,
  metadata: any,
  account: { _id, name, type, colorHex } | null,
  outflowType: { _id, name, emoji, colorHex } | null
}>
```

### `transactions.getTransaction`

**Type:** Query

Gets a specific transaction by ID.

**Arguments:**
```typescript
{
  id: Id<"transactions">
}
```

### `transactions.createTransaction`

**Type:** Mutation

Creates a new transaction.

**Arguments:**
```typescript
{
  amount: number,
  date: number,              // Timestamp
  accountId: Id<"accounts">,
  outflowTypeId: Id<"outflowTypes">,
  note: string,
  metadata?: any
}
```

### `transactions.updateTransaction`

**Type:** Mutation

Updates an existing transaction.

**Arguments:**
```typescript
{
  id: Id<"transactions">,
  amount?: number,
  date?: number,
  accountId?: Id<"accounts">,
  outflowTypeId?: Id<"outflowTypes">,
  note?: string,
  metadata?: any
}
```

### `transactions.deleteTransaction`

**Type:** Mutation

Deletes a transaction.

**Arguments:**
```typescript
{
  id: Id<"transactions">
}
```

---

## Outflow Types (Categories) API

### `outflowTypes.listOutflowTypes`

**Type:** Query

Lists all outflow types (categories) for the current user.

**Returns:**
```typescript
Array<{
  _id: Id<"outflowTypes">,
  name: string,
  emoji: string,
  colorHex: string,
  isCustom: boolean,
  extraFields: Array<{
    key: string,
    label: string,
    type: "text" | "number" | "date" | "toggle"
  }>
}>
```

### `outflowTypes.createOutflowType`

**Type:** Mutation

Creates a new outflow type.

**Arguments:**
```typescript
{
  name: string,
  emoji: string,
  colorHex: string,
  extraFields?: Array<{
    key: string,
    label: string,
    type: "text" | "number" | "date" | "toggle"
  }>
}
```

### `outflowTypes.updateOutflowType`

**Type:** Mutation

Updates an existing outflow type.

**Arguments:**
```typescript
{
  id: Id<"outflowTypes">,
  name?: string,
  emoji?: string,
  colorHex?: string,
  extraFields?: Array<{...}>
}
```

### `outflowTypes.deleteOutflowType`

**Type:** Mutation

Deletes an outflow type. Will fail if transactions are using it.

**Arguments:**
```typescript
{
  id: Id<"outflowTypes">
}
```

---

## Budgets API

### `budgets.listBudgets`

**Type:** Query

Lists budgets for the current user, optionally filtered by month.

**Arguments:**
```typescript
{
  month?: string  // Format: "YYYY-MM"
}
```

**Returns:**
```typescript
Array<{
  _id: Id<"budgets">,
  amount: number,
  month: string,
  outflowType: { _id, name, emoji, colorHex } | null,
  spent: number  // Calculated from transactions
}>
```

### `budgets.createBudget`

**Type:** Mutation

Creates a new budget.

**Arguments:**
```typescript
{
  outflowTypeId: Id<"outflowTypes">,
  amount: number,
  month: string  // Format: "YYYY-MM"
}
```

### `budgets.updateBudget`

**Type:** Mutation

Updates an existing budget.

**Arguments:**
```typescript
{
  id: Id<"budgets">,
  amount?: number,
  month?: string
}
```

### `budgets.deleteBudget`

**Type:** Mutation

Deletes a budget.

**Arguments:**
```typescript
{
  id: Id<"budgets">
}
```

---

## Insights API

### `insights.getMonthlySpending`

**Type:** Query

Gets spending aggregated by category for a specific month.

**Arguments:**
```typescript
{
  month: string  // Format: "YYYY-MM"
}
```

**Returns:**
```typescript
Array<{
  outflowTypeId: Id<"outflowTypes">,
  name: string,
  emoji: string,
  colorHex: string,
  total: number,
  count: number
}>
```

### `insights.getSpendingTrend`

**Type:** Query

Gets spending trend over multiple months.

**Arguments:**
```typescript
{
  months: number  // Number of months to include
}
```

**Returns:**
```typescript
Array<{
  month: string,
  total: number
}>
```

### `insights.getTopExpenses`

**Type:** Query

Gets the largest transactions.

**Arguments:**
```typescript
{
  limit?: number  // Default: 10
}
```

---

## Usage Examples

### React Query Hook

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

function MyComponent() {
  // Query - automatically updates on changes
  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 20
  });

  // Mutation
  const createTransaction = useMutation(api.transactions.createTransaction);

  const handleAdd = async () => {
    await createTransaction({
      amount: 100,
      date: Date.now(),
      accountId: "...",
      outflowTypeId: "...",
      note: "Coffee"
    });
  };
}
```

### Error Handling

```typescript
const createTransaction = useMutation(api.transactions.createTransaction);

try {
  await createTransaction({ ... });
  toast.success("Transaction added!");
} catch (error) {
  toast.error("Failed to add transaction");
  console.error(error);
}
```

---

## Authentication

All API calls require a valid Clerk authentication token. The Convex client automatically handles this when configured with Clerk.

```typescript
// main.tsx setup
<ClerkProvider publishableKey={CLERK_KEY}>
  <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    <App />
  </ConvexProviderWithClerk>
</ClerkProvider>
```

---

## Rate Limits

Convex handles rate limiting automatically. For most use cases, you won't hit any limits. However:

- Queries: Unlimited (real-time subscriptions)
- Mutations: Very high limits
- Storage: Based on Convex plan

---

<p align="center">
  <a href="./schema.md">Database Schema →</a>
</p>
