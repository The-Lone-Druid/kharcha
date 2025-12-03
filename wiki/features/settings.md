# Settings

Customize Kharcha to match your preferences and manage your account.

---

## Accessing Settings

Navigate to **Settings** from:

- Sidebar menu (desktop)
- Bottom navigation (mobile)
- User menu dropdown

---

## Available Settings

### Currency

**What it does:** Sets the currency symbol for all amounts.

**Options:**

- INR (₹) - Indian Rupee
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- And more...

**Note:** This is a display preference only. It doesn't convert amounts.

### Theme

**What it does:** Changes the app's appearance.

**Options:**
| Theme | Description |
|-------|-------------|
| Light | Bright background, dark text |
| Dark | Dark background, light text |
| System | Matches your device setting |

**Tips:**

- Dark mode is easier on the eyes at night
- System follows your OS preference automatically

### Language

**What it does:** Interface language preference.

**Currently supported:**

- English

**Coming soon:**

- Hindi
- Other languages

---

## 🔔 Notification Preferences

Control what notifications you receive.

### Global Notifications

**Master Switch**
- Enable/disable all notifications
- When disabled, no notifications are sent

### Subscription Reminders

**What it controls:**
- Reminders for subscription renewals
- Sent 24 hours before renewal date

**Default:** Enabled

### Due Date Reminders

**What it controls:**
- Reminders for upcoming payments
- Loan due dates, bill payments

**Default:** Enabled

**Note:** Due date reminders are planned for future releases.

### Browser Notifications

**Permission Required**
- Click "Enable Notifications" to allow browser alerts
- You'll see a permission prompt from your browser

**Benefits:**
- Instant notifications without opening the app
- Works even when Kharcha isn't active

---

## Account Information

View your account details:

- Name
- Email
- Profile picture

These are synced from your Clerk authentication.

---

## 📤 Data Export

Export your financial data for backup, analysis, or tax purposes.

### Export Options

**CSV Export**
- Compatible with Excel, Google Sheets, and accounting software
- Includes all transaction details
- Ready for import into other financial tools

**What's Included in CSV:**
- Date and time
- Amount (with currency symbol)
- Category (outflow type)
- Account name and type
- Transaction notes
- Provider details (for subscriptions)

### How to Export

1. Go to **Settings**
2. Click **"Export Data"**
3. Choose your preferred format
4. Download the file

### Use Cases

- **Tax Preparation** - Export for your accountant
- **Backup** - Keep a copy of your financial data
- **Analysis** - Import into Excel for custom reports
- **Migration** - Move data to other financial apps

---
  "outflowTypes": [...],
  "transactions": [...],
  "budgets": [...],
  "preferences": {...},
  "exportedAt": "2024-01-15T10:30:00Z"
}
```

### Use Cases for Export

- **Backup:** Keep a local copy of your data
- **Analysis:** Import into Excel/Google Sheets
- **Migration:** Move to another system
- **Records:** Tax documentation

---

## Privacy & Security

### Your Data

- Stored securely on Convex servers
- Only accessible by you
- Encrypted in transit and at rest

### Authentication

- Powered by Clerk
- Supports multiple sign-in methods
- Session management handled automatically

### What We Don't Do

- ❌ Sell your data
- ❌ Share with third parties
- ❌ Access your bank accounts
- ❌ Store payment credentials

---

## Logging Out

To log out:

1. Click your profile picture/icon
2. Select **"Log out"**

Or go to Settings and click **"Log out"**.

**Note:** Your data remains safe. You can log back in anytime to access it.

---

## Account Deletion

To delete your account and all data:

1. Contact support (feature coming soon)
2. Request account deletion
3. All data will be permanently removed

**⚠️ Warning:** This action is irreversible.

---

## Troubleshooting

### Settings Not Saving

1. Check your internet connection
2. Try refreshing the page
3. Log out and log back in
4. Clear browser cache

### Theme Not Changing

1. Make sure to save after selecting
2. Try selecting "System" then your preference
3. Refresh the page

### Export Not Working

1. Ensure you have transactions to export
2. Check browser download permissions
3. Try a different browser

---

## Settings Recommendations

### New Users

1. Set your local currency first
2. Choose your preferred theme
3. Review default categories

### Regular Users

1. Export data monthly for backup
2. Review settings quarterly
3. Keep the app updated

---

## Future Settings (Coming Soon)

Planned additions:

- Notification preferences
- Default account selection
- Date format preferences
- First day of week setting
- Data import feature
- Account linking

---

<p align="center">
  <a href="../README.md">← Back to Wiki Home</a>
</p>
