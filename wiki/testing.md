# Testing Guide

Kharcha maintains high code quality with a comprehensive testing strategy and automated CI/CD pipeline.

---

## 🧪 Testing Overview

### Test Coverage

- **Frontend Tests:** 150+ React component and utility tests
- **Backend Tests:** 142+ Convex function tests
- **Total Tests:** 290+ automated tests
- **Coverage Target:** 90%+ codebase coverage

### Testing Tools

- **Vitest** - Fast testing framework
- **React Testing Library** - Component testing utilities
- **jsdom** - Browser environment simulation
- **@testing-library/jest-dom** - Custom Jest matchers

---

## 🏃 Running Tests

### Development Testing

```bash
# Run all tests
npm run test:all

# Run frontend tests only
npm run test:run

# Run backend tests only
npm run test:convex

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Generate full coverage (frontend + backend)
npm run test:coverage:all
```

### CI/CD Testing

Tests run automatically on:

- Every push to main branch
- Every pull request
- Before deployments

---

## 📁 Test Structure

### Frontend Tests (`src/`)

```
src/
├── components/
│   ├── ui/              # UI component tests
│   └── custom/          # Custom component tests
├── hooks/               # Custom hook tests
├── lib/                 # Utility function tests
└── routes/              # Route component tests
```

### Backend Tests (`convex/`)

```
convex/
├── accounts.test.ts     # Account CRUD operations
├── transactions.test.ts # Transaction management
├── budgets.test.ts      # Budget operations
├── insights.test.ts     # Analytics queries
├── notifications.test.ts # Notification system
├── outflowTypes.test.ts # Category management
└── users.test.ts        # User management
```

---

## 🛠️ Writing Tests

### Component Testing Example

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Convex Function Testing Example

```typescript
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

describe("accounts", () => {
  it("should create account", async () => {
    const t = convexTest(schema);

    await t.run(async ({ db }) => {
      const account = await db.insert("accounts", {
        name: "Test Account",
        type: "bank",
        clerkId: "test-user",
      });

      expect(account).toBeDefined();
    });
  });
});
```

---

## 🔧 Test Configuration

### Vitest Config (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

### Convex Test Config (`convex/vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

---

## 🎯 Testing Best Practices

### Frontend Testing

1. **Test User Interactions** - Click buttons, fill forms, navigate
2. **Test Visual States** - Loading, error, success states
3. **Test Accessibility** - Screen reader support, keyboard navigation
4. **Mock External Dependencies** - API calls, browser APIs
5. **Use Descriptive Test Names** - Explain what behavior is being tested

### Backend Testing

1. **Test Business Logic** - Core functionality and edge cases
2. **Test Data Validation** - Input validation and error handling
3. **Test Authentication** - User permissions and access control
4. **Test Database Operations** - CRUD operations and queries
5. **Use Realistic Test Data** - Representative data for your domain

### General Guidelines

1. **One Concept Per Test** - Each test should verify one behavior
2. **Arrange, Act, Assert** - Clear test structure
3. **Descriptive Names** - Tests should read like documentation
4. **Independent Tests** - Tests shouldn't depend on each other
5. **Fast Execution** - Keep tests running quickly

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

Tests run automatically in these scenarios:

- **Pull Requests** - All tests must pass before merge
- **Main Branch** - Quality gate before deployment
- **Manual Triggers** - Can run tests manually

### Deployment Pipeline

```
Code Push → Tests Run → Quality Checks → Deploy
    ↓           ↓           ↓              ↓
   Lint       Coverage    Security      Vercel
 Format       Threshold   Scan         + Convex
```

### Quality Gates

- All tests must pass
- Code coverage above 90%
- No ESLint errors
- Code formatted with Prettier
- TypeScript compilation successful

---

## 🐛 Debugging Tests

### Common Issues

**Test Timeout**

```typescript
it("slow test", async () => {
  // Increase timeout for slow operations
}, 10000);
```

**Async Operations**

```typescript
it("handles async", async () => {
  await waitFor(() => {
    expect(element).toBeInTheDocument();
  });
});
```

**Mocking Dependencies**

```typescript
import { vi } from "vitest";

const mockFunction = vi.fn();
vi.mock("./module", () => ({
  functionToMock: mockFunction,
}));
```

### Debugging Tools

- **Test UI** - `npm run test:ui` for visual test runner
- **Watch Mode** - `npm run test` for continuous testing
- **Coverage Reports** - See which lines aren't tested
- **Console Logs** - Debug with `console.log` in tests

---

## 📊 Coverage Reports

### Understanding Coverage

- **Statements** - Executed code lines
- **Branches** - If/else paths taken
- **Functions** - Functions called
- **Lines** - Lines executed

### Coverage Goals

- **Frontend:** 90%+ coverage
- **Backend:** 95%+ coverage
- **Critical Paths:** 100% coverage

### Excluded Files

Some files are excluded from coverage:

- UI components (auto-generated)
- Test utilities
- Configuration files

---

## 🤝 Contributing

When contributing code:

1. **Write Tests First** - TDD approach encouraged
2. **Maintain Coverage** - Don't decrease overall coverage
3. **Test Edge Cases** - Error states, boundary conditions
4. **Update Tests** - When changing existing functionality
5. **Run Full Suite** - `npm run test:all` before submitting

---

<p align="center">
  <a href="../README.md">← Back to Wiki Home</a>
</p>
