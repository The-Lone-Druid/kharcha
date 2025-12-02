# Getting Started with Kharcha

This guide will walk you through setting up Kharcha on your local machine for development or self-hosting.

## Prerequisites

Before you begin, make sure you have the following:

### Required Software

| Software | Minimum Version | Download |
|----------|-----------------|----------|
| Node.js | v18.0.0 | [nodejs.org](https://nodejs.org/) |
| npm or pnpm | npm 9+ / pnpm 8+ | Comes with Node.js |
| Git | Any recent version | [git-scm.com](https://git-scm.com/) |

### Required Accounts

You'll need accounts on these platforms (all have free tiers):

1. **[Convex](https://www.convex.dev/)** - For the backend database and functions
2. **[Clerk](https://clerk.com/)** - For user authentication

---

## Step-by-Step Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/The-Lone-Druid/kharcha.git
cd kharcha
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### Step 3: Set Up Convex Backend

#### 3.1 Create a Convex Project

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev/)
2. Click "New Project"
3. Give your project a name (e.g., "kharcha")
4. Select your preferred region

#### 3.2 Link Your Local Project

```bash
# Login to Convex (opens browser for authentication)
npx convex login

# Start the development server (this will prompt you to select your project)
npx convex dev
```

The first time you run `convex dev`, it will:
- Ask you to select or create a Convex project
- Generate a `.env.local` file with your `VITE_CONVEX_URL`
- Push your schema and functions to Convex

### Step 4: Set Up Clerk Authentication

#### 4.1 Create a Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com/)
2. Click "Add application"
3. Name your application (e.g., "Kharcha")
4. Select the sign-in options you want (Email, Google, GitHub, etc.)
5. Click "Create application"

#### 4.2 Get Your API Keys

In your Clerk dashboard:
1. Go to **API Keys** in the sidebar
2. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)

#### 4.3 Configure Convex with Clerk

1. In Clerk dashboard, go to **JWT Templates**
2. Create a new template for Convex:
   - Click "New template"
   - Select "Convex"
   - Note the **Issuer URL** shown

3. In Convex dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add: `CLERK_ISSUER_URL` = your Clerk Issuer URL

### Step 5: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Convex (this should already be added by convex dev)
VITE_CONVEX_URL=https://your-project-id.convex.cloud
```

### Step 6: Start the Development Server

```bash
npm run dev
```

This runs both Vite and Convex development servers concurrently.

Open your browser and navigate to:
- **App:** [http://localhost:5173](http://localhost:5173)

---

## Verifying Your Setup

### ✅ Checklist

- [ ] App loads without errors at localhost:5173
- [ ] You can see the login/signup page
- [ ] You can create an account or sign in
- [ ] After login, you're redirected to the dashboard
- [ ] Convex dashboard shows your schema tables

### Common Issues

#### "Failed to fetch" or Network Errors

- Ensure Convex dev server is running (`npx convex dev`)
- Check that `VITE_CONVEX_URL` is correct in `.env.local`

#### "Unauthorized" or Auth Errors

- Verify `CLERK_ISSUER_URL` is set in Convex environment variables
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` matches your Clerk app

#### Database Tables Not Created

Run:
```bash
npx convex dev
```
This will push your schema to Convex.

---

## Optional: Seed Initial Data

To populate your account with default expense categories:

```bash
npm run seed
```

This creates default outflow types like:
- 🍔 Food & Dining
- 🚗 Transportation
- 🏠 Housing
- 🎮 Entertainment
- And more...

---

## Next Steps

Now that you have Kharcha running, learn how to:

1. [Create your first account](./first-steps.md#creating-accounts)
2. [Add transactions](./first-steps.md#adding-transactions)
3. [Set up budgets](./first-steps.md#setting-budgets)

---

<p align="center">
  <a href="./first-steps.md">First Steps →</a>
</p>
