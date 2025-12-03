# Database Schema

This document describes the database schema used by Kharcha. The database is managed by Convex.

---

## Overview

Kharcha uses the following tables:

| Table             | Purpose                               |
| ----------------- | ------------------------------------- |
| `users`           | User accounts                         |
| `userPreferences` | User settings and preferences         |
| `accounts`        | Financial accounts (bank, cash, etc.) |
| `outflowTypes`    | Expense categories                    |
| `transactions`    | Individual transactions               |
| `budgets`         | Monthly budget limits                 |
| `notifications`   | User notifications                    |

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐
│   users     │───────│  userPreferences │
└─────────────┘       └──────────────────┘
       │
       │ userId
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  accounts   │ │ outflowTypes│ │   budgets   │ │notifications│
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
       │              │              │
       │ accountId    │ outflowTypeId│ outflowTypeId
       │              │              │
       └──────────────┼──────────────┘
                      ▼
               ┌─────────────┐
               │transactions │
               └─────────────┘
```

---

## Table Definitions

### users

Stores user account information synced from Clerk.

| Field      | Type          | Required | Description          |
| ---------- | ------------- | -------- | -------------------- |
| `_id`      | `Id<"users">` | Auto     | Unique identifier    |
| `clerkId`  | `string`      | No       | Clerk user ID        |
| `name`     | `string`      | No       | User's display name  |
| `email`    | `string`      | Yes      | User's email address |
| `imageUrl` | `string`      | No       | Profile picture URL  |

**Indexes:**

- `by_clerk_id` - Lookup by Clerk ID

---

### userPreferences

Stores user preferences and settings.

| Field                 | Type                    | Required | Description                      |
| --------------------- | ----------------------- | -------- | -------------------------------- |
| `_id`                 | `Id<"userPreferences">` | Auto     | Unique identifier                |
| `userId`              | `Id<"users">`           | Yes      | Reference to user                |
| `currency`            | `string`                | Yes      | Preferred currency (e.g., "INR") |
| `language`            | `string`                | Yes      | Language preference (e.g., "en") |
| `darkMode`            | `boolean`               | Yes      | Dark mode enabled                |
| `onboardingCompleted` | `boolean`               | Yes      | Has completed onboarding         |

**Indexes:**

- `by_user` - Lookup by user ID

---

### accounts

Financial accounts belonging to users.

| Field        | Type             | Required | Description                     |
| ------------ | ---------------- | -------- | ------------------------------- |
| `_id`        | `Id<"accounts">` | Auto     | Unique identifier               |
| `name`       | `string`         | Yes      | Account name                    |
| `type`       | `string`         | Yes      | Account type (see below)        |
| `colorHex`   | `string`         | Yes      | Display color (e.g., "#3B82F6") |
| `userId`     | `Id<"users">`    | Yes      | Reference to owner              |
| `isArchived` | `boolean`        | Yes      | Whether account is archived     |

**Account Types:**

- `"Cash"`
- `"Bank"`
- `"Credit Card"`
- `"UPI"`
- `"Loan"`
- `"Wallet"`
- `"Other"`

**Indexes:**

- `by_user` - All accounts for a user
- `by_name` - Lookup by user and name

---

### outflowTypes

Expense categories (types of spending).

| Field         | Type                 | Required | Description             |
| ------------- | -------------------- | -------- | ----------------------- |
| `_id`         | `Id<"outflowTypes">` | Auto     | Unique identifier       |
| `name`        | `string`             | Yes      | Category name           |
| `emoji`       | `string`             | Yes      | Display emoji           |
| `colorHex`    | `string`             | Yes      | Display color           |
| `isCustom`    | `boolean`            | Yes      | User-created vs default |
| `extraFields` | `array`              | Yes      | Custom metadata fields  |
| `userId`      | `Id<"users">`        | Yes      | Reference to owner      |

**Extra Fields Structure:**

```typescript
{
  key: string,     // Field identifier
  label: string,   // Display label
  type: "text" | "number" | "date" | "toggle"
}
```

**Indexes:**

- `by_user` - All categories for a user
- `by_name` - Lookup by user and name

---

### transactions

Individual financial transactions.

| Field            | Type                 | Required | Description               |
| ---------------- | -------------------- | -------- | ------------------------- |
| `_id`            | `Id<"transactions">` | Auto     | Unique identifier         |
| `amount`         | `number`             | Yes      | Transaction amount        |
| `date`           | `number`             | Yes      | Timestamp of transaction  |
| `accountId`      | `Id<"accounts">`     | Yes      | Account used              |
| `outflowTypeId`  | `Id<"outflowTypes">` | Yes      | Expense category          |
| `note`           | `string`             | Yes      | Description/note          |
| `receiptImageId` | `Id<"_storage">`     | No       | Attached receipt image    |
| `metadata`       | `any`                | No       | Extra field values (JSON) |
| `userId`         | `Id<"users">`        | Yes      | Reference to owner        |

**Indexes:**

- `by_user` - All transactions for a user
- `by_account` - Transactions for an account
- `by_outflow_type` - Transactions by category
- `by_user_date` - User transactions sorted by date

---

### budgets

Monthly spending budgets per category.

| Field           | Type                 | Required | Description               |
| --------------- | -------------------- | -------- | ------------------------- |
| `_id`           | `Id<"budgets">`      | Auto     | Unique identifier         |
| `outflowTypeId` | `Id<"outflowTypes">` | Yes      | Category being budgeted   |
| `amount`        | `number`             | Yes      | Budget limit              |
| `month`         | `string`             | Yes      | Month (format: "YYYY-MM") |
| `userId`        | `Id<"users">`        | Yes      | Reference to owner        |

**Indexes:**

- `by_user` - All budgets for a user
- `by_outflow_type_month` - Lookup by category and month

---

### notifications

User notifications for reminders and alerts.

| Field           | Type                  | Required | Description          |
| --------------- | --------------------- | -------- | -------------------- |
| `_id`           | `Id<"notifications">` | Auto     | Unique identifier    |
| `userId`        | `Id<"users">`         | Yes      | Reference to user    |
| `type`          | `string`              | Yes      | "renewal" or "due"   |
| `transactionId` | `Id<"transactions">`  | Yes      | Related transaction  |
| `message`       | `string`              | Yes      | Notification message |
| `isRead`        | `boolean`             | Yes      | Read status          |
| `createdAt`     | `number`              | Yes      | Creation timestamp   |

**Indexes:**

- `by_user` - All notifications for a user
- `by_user_unread` - Unread notifications

---

## Data Validation

Convex uses validators to ensure data integrity:

```typescript
// Example: Account type validation
type: v.union(
  v.literal("Cash"),
  v.literal("Bank"),
  v.literal("Credit Card"),
  v.literal("UPI"),
  v.literal("Loan"),
  v.literal("Wallet"),
  v.literal("Other")
);
```

---

## Cascading Deletes

Currently, cascading deletes are not automatic:

| When Deleting | Fails If             |
| ------------- | -------------------- |
| Account       | Has transactions     |
| Outflow Type  | Has transactions     |
| User          | Has any related data |

This is intentional to prevent accidental data loss.

---

## Data Privacy

- Each user can only access their own data
- Queries filter by `userId` automatically
- No cross-user data access is possible
- Authentication is required for all operations

---

## Schema Definition (Convex)

The full schema is defined in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  // ... other tables
});
```

---

<p align="center">
  <a href="./README.md">← Back to Wiki Home</a>
</p>
