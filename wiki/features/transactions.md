# Transactions

Transactions are the heart of Kharcha. Every expense, income, or transfer is recorded as a transaction.

---

## What is a Transaction?

A transaction records the movement of money:

- **Expense**: Money going out (e.g., buying coffee)
- **Income**: Money coming in (e.g., salary)
- **Transfer**: Moving money between accounts

---

## Transaction Fields

| Field        | Required | Description                   |
| ------------ | -------- | ----------------------------- |
| **Amount**   | ✅       | How much money                |
| **Account**  | ✅       | Which account was used        |
| **Category** | ✅       | Type of expense               |
| **Date**     | ✅       | When it happened              |
| **Note**     | ❌       | Optional description          |
| **Receipt**  | ❌       | Attach an image (coming soon) |

---

## Adding a Transaction

### Quick Add (Dashboard)

1. From the Dashboard, click **"Add Transaction"**
2. Fill in the details
3. Click **Save**

### From Transactions Page

1. Navigate to **Transactions**
2. Click **"Add Transaction"**
3. Complete the form
4. Click **Save**

### Form Tips

- **Amount**: Enter the actual amount spent
- **Account**: Double-check you're selecting the right account
- **Category**: Pick the most appropriate category
- **Date**: Defaults to now, change if logging a past expense
- **Note**: Add context for future reference

---

## Viewing Transactions

### Transaction List

The Transactions page shows all your transactions:

- Sorted by date (newest first)
- Shows amount, category, account, and note
- Color-coded by category

### Transaction Card Details

Each transaction displays:

- Category emoji and name
- Transaction amount
- Account name and type
- Date and time
- Note (if provided)
- Edit and Delete buttons

---

## Filtering Transactions

Use filters to find specific transactions:

### By Date

| Filter     | Shows             |
| ---------- | ----------------- |
| All        | Everything        |
| Today      | Today only        |
| This Week  | Last 7 days       |
| This Month | Current month     |
| Custom     | Select date range |

### By Account

Select a specific account to see only its transactions.

### By Category

Filter to see all transactions of a specific type (e.g., all "Food & Dining").

### By Search

Type in the search box to filter by:

- Note content
- Partial matches work

---

## Editing a Transaction

1. Find the transaction you want to edit
2. Click the **Edit** button (pencil icon)
3. Modify the details
4. Click **Save**

You can change:

- Amount
- Account
- Category
- Date
- Note

---

## Deleting a Transaction

1. Find the transaction
2. Click the **Delete** button (trash icon)
3. Confirm the deletion in the dialog

**⚠️ Warning:** Deletion is permanent and cannot be undone.

---

## Transaction Best Practices

### 1. Log Immediately

The best time to log a transaction is right after it happens:

- You remember the exact amount
- You know which account was used
- Details are fresh in your mind

### 2. Be Consistent

- Always use the same category for similar expenses
- Use consistent note formats
- Select the correct account every time

### 3. Add Useful Notes

Good notes:

- ✅ "Dinner with John at Pizza Hut"
- ✅ "Monthly electricity bill - March"
- ✅ "Amazon order #12345"

Less useful:

- ❌ "Food"
- ❌ "Bill"
- ❌ (blank)

### 4. Review Regularly

- Daily: Quick scan for missing transactions
- Weekly: Review accuracy
- Monthly: Reconcile with bank statements

---

## Common Scenarios

### Splitting a Bill

When you split a bill with friends:

- Log only YOUR share
- Example: "Dinner split 4 ways" → Log ₹500, not ₹2000

### Cash Withdrawal

Two approaches:

**Approach A: Track as Transfer**

- Deduct from bank account
- Add to cash account
- No category needed

**Approach B: Don't Track**

- Only track when you spend the cash
- Simpler but less accurate account balances

### Refunds

- Log as a negative expense (same category)
- Or log as income with note "Refund"

### Gifts

**Giving gifts:**

- Category: Gifts
- Account: Whichever you paid from

**Receiving cash gifts:**

- Log as income
- Add to Cash or Bank account

---

## Transaction History

Your transaction history is preserved forever:

- No automatic deletion
- Filter by any date range
- Export anytime from Settings

---

## Bulk Operations (Coming Soon)

Future features:

- Select multiple transactions
- Bulk delete
- Bulk category change
- Bulk export

---

<p align="center">
  <a href="./categories.md">Categories →</a>
</p>
