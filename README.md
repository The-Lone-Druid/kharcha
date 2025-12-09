# Kharcha - Personal Finance Tracker

<p align="center">
  <img src="public/favicon.svg" alt="Kharcha Logo" width="120" />
</p>

**Kharcha** (Hindi for "expense") is a modern, full-featured personal finance management application built with React, TypeScript, and Convex. Track your expenses, manage multiple accounts, set budgets, and gain insights into your spending habits.

## ✨ Features

- 🏦 **Multi-Account Management** - Track Cash, Bank, Credit Card, UPI, Wallet, Loan accounts
- 💸 **Transaction Tracking** - Log income and expenses with detailed categorization
- 📊 **Visual Insights** - Charts and analytics to understand your spending patterns
- 📂 **Custom Categories** - Create personalized outflow types with custom colors and emojis
- 💳 **Subscription Tracking** - Manage recurring payments with renewal reminders
- 🎯 **Budget Management** - Set monthly budgets for different expense categories
- 🔔 **Smart Notifications** - Automated reminders for subscriptions and due dates
- 🌙 **Dark/Light Mode** - Beautiful UI with theme support
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔐 **Secure Authentication** - Powered by Clerk authentication
- ⚡ **Real-time Updates** - Powered by Convex backend
- 📤 **Data Export** - Export transactions to CSV format
- 🧪 **Comprehensive Testing** - 290+ tests with CI/CD pipeline
- 🎨 **Code Quality** - Prettier formatting and ESLint integration

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Routing:** TanStack Router
- **Backend:** Convex (serverless database & functions)
- **Authentication:** Clerk
- **Charts:** Recharts
- **Forms:** TanStack Form, React Hook Form
- **Testing:** Vitest, React Testing Library, jsdom
- **Code Quality:** ESLint, Prettier, Husky
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel, Convex

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Convex](https://www.convex.dev/) account
- A [Clerk](https://clerk.com/) account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/The-Lone-Druid/kharcha.git
cd kharcha
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set Up Convex

1. Create a new project at [Convex Dashboard](https://dashboard.convex.dev/)
2. Install the Convex CLI globally (if not already installed):
   ```bash
   npm install -g convex
   ```
3. Login to Convex:
   ```bash
   npx convex login
   ```
4. Initialize Convex in your project (this will link to your Convex project):
   ```bash
   npx convex dev
   ```

### 4. Set Up Clerk Authentication

1. Create a new application at [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to your application settings
3. Copy your **Publishable Key** and **Secret Key**
4. In Convex Dashboard, go to Settings → Environment Variables and add:
   - `CLERK_ISSUER_URL` - Your Clerk Frontend API URL (found in Clerk Dashboard)

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Convex (auto-generated when running convex dev)
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### 6. Run the Development Server

```bash
npm run dev
```

This command runs both the Vite dev server and Convex dev server concurrently.

The app will be available at:

- **Frontend:** http://localhost:5173
- **Convex Dashboard:** Opens automatically or visit your Convex project dashboard

### 7. Available Scripts

Kharcha provides several npm scripts for different development workflows:

#### Development

- `npm run dev` - Start development servers (Vite + Convex)
- `npm run preview` - Preview production build locally

#### Testing

- `npm test` - Run tests in watch mode
- `npm run test:run` - Run all frontend tests once
- `npm run test:convex` - Run all Convex backend tests
- `npm run test:all` - Run both frontend and backend tests
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

#### Building

- `npm run build` - **Full build with tests** (recommended for CI/production)
- `npm run build:only` - **Build without running tests** (use when tests already passed)
- `npm run build:fast` - Fast build with warning message (same as build:only)

#### Code Quality

- `npm run lint` - Run linting and formatting
- `npm run lint:check` - Check linting and formatting without fixing
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

#### Database

- `npm run seed` - Seed default outflow types for all users

### 8. Seed Default Data (Optional)

To seed default outflow types for all users:

```bash
npm run seed
```

## 📁 Project Structure

```
kharcha/
├── convex/                 # Convex backend functions
│   ├── accounts.ts         # Account CRUD operations
│   ├── transactions.ts     # Transaction management
│   ├── budgets.ts          # Budget operations
│   ├── outflowTypes.ts     # Category management
│   ├── insights.ts         # Analytics queries
│   ├── schema.ts           # Database schema
│   └── users.ts            # User management
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...
│   ├── routes/             # TanStack Router pages
│   │   ├── _authenticated/ # Protected routes
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript types
│   └── contexts/           # React contexts
├── public/                 # Static assets
└── wiki/                   # Documentation
```

## 🧪 Testing & Quality

Kharcha maintains high code quality with comprehensive testing and automated checks.

### Testing Suite

- **Frontend Tests:** 150+ React component and utility tests
- **Backend Tests:** 142+ Convex function tests
- **Coverage:** 90%+ codebase coverage
- **Tools:** Vitest, React Testing Library, jsdom

### Code Quality

- **Linting:** ESLint with React and TypeScript rules
- **Formatting:** Prettier with Tailwind CSS plugin
- **Type Checking:** TypeScript strict mode
- **Automated:** Pre-commit hooks and CI/CD checks

### CI/CD Pipeline

- **GitHub Actions:** Automated testing on every push/PR
- **Quality Gates:** Tests must pass before deployment
- **Deployment:** Automatic Vercel + Convex deployment on main branch

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/)
3. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_CONVEX_URL`
4. Deploy!

### Deploy Convex Backend

```bash
npx convex deploy
```

## 📚 Documentation

For detailed documentation, see the [Wiki](./wiki/README.md):

- [Getting Started Guide](./wiki/getting-started.md)
- [Features Overview](./wiki/features.md)
- [Common Use Cases](./wiki/use-cases.md)
- [API Reference](./wiki/api-reference.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Convex](https://www.convex.dev/) for the backend infrastructure
- [Clerk](https://clerk.com/) for authentication
- [TanStack](https://tanstack.com/) for routing and form management

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/The-Lone-Druid">The-Lone-Druid</a>
</p>
