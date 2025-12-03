# Testing Guide for Kharcha

## Quick Start

```bash
# Run tests in watch mode (recommended during development)
npm test

# Run all tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

---

## Test File Naming

Place test files next to the code they test:

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts        # ← Test file
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx  # ← Test file
```

---

## Basic Test Structure

```typescript
import { describe, it, expect } from "vitest";

describe("Feature or Component Name", () => {
  // Group related tests
  describe("specific functionality", () => {
    it("should do something specific", () => {
      // Arrange - set up
      const input = "test";

      // Act - do the thing
      const result = myFunction(input);

      // Assert - check results
      expect(result).toBe("expected");
    });
  });
});
```

---

## Common Assertions

```typescript
// Equality
expect(value).toBe(expected); // Strict equality (===)
expect(value).toEqual(expected); // Deep equality for objects
expect(value).not.toBe(unexpected); // Negation

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 5); // For floating point

// Strings
expect(string).toContain("substring");
expect(string).toMatch(/regex/);
expect(string).toHaveLength(5);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toMatchObject({ partial: "match" });
```

---

## Testing React Components

### Rendering

```typescript
import { render, screen } from "@/test/test-utils";
import { MyComponent } from "./my-component";

it("renders correctly", () => {
  render(<MyComponent />);

  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

### Finding Elements

```typescript
// By role (preferred - accessible)
screen.getByRole("button", { name: /submit/i });
screen.getByRole("textbox");
screen.getByRole("heading", { level: 1 });

// By text
screen.getByText("Exact Text");
screen.getByText(/partial/i); // regex, case-insensitive

// By label (for form fields)
screen.getByLabelText("Email");

// By placeholder
screen.getByPlaceholderText("Enter email");

// By test ID (last resort)
screen.getByTestId("custom-element");
```

### Query Types

```typescript
// getBy - throws if not found (use for elements that should exist)
screen.getByRole("button");

// queryBy - returns null if not found (use for elements that might not exist)
screen.queryByRole("button");

// findBy - async, waits for element (use for elements that appear later)
await screen.findByRole("button");

// getAllBy, queryAllBy, findAllBy - for multiple elements
screen.getAllByRole("listitem");
```

### User Interactions

```typescript
import { render, screen } from "@/test/test-utils";

it("handles click", async () => {
  const handleClick = vi.fn();
  const { user } = render(<Button onClick={handleClick}>Click</Button>);

  await user.click(screen.getByRole("button"));

  expect(handleClick).toHaveBeenCalled();
});

it("handles typing", async () => {
  const { user } = render(<Input />);

  await user.type(screen.getByRole("textbox"), "Hello");

  expect(screen.getByRole("textbox")).toHaveValue("Hello");
});

it("handles keyboard", async () => {
  const { user } = render(<Component />);

  await user.keyboard("{Enter}");
  await user.tab();
});
```

---

## Mocking

### Mock Functions

```typescript
import { vi } from "vitest";

// Create a mock function
const mockFn = vi.fn();
mockFn.mockReturnValue("value");
mockFn.mockResolvedValue("async value");

// Check calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("arg");
expect(mockFn).toHaveBeenCalledTimes(2);
```

### Mock Modules

```typescript
// Mock entire module
vi.mock("@/lib/api", () => ({
  fetchData: vi.fn().mockResolvedValue({ data: "test" }),
}));

// Mock specific export
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "1" }, isLoggedIn: true }),
}));
```

---

## Testing Async Code

```typescript
it("handles async operations", async () => {
  render(<AsyncComponent />);

  // Wait for element to appear
  const result = await screen.findByText("Loaded");
  expect(result).toBeInTheDocument();
});

it("handles loading states", async () => {
  render(<AsyncComponent />);

  // Check loading state
  expect(screen.getByText("Loading...")).toBeInTheDocument();

  // Wait for loaded state
  await screen.findByText("Loaded");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});
```

---

## Best Practices

### Do ✅

1. **Test behavior, not implementation**

   ```typescript
   // Good: Tests what user sees
   expect(screen.getByText("Success")).toBeInTheDocument();

   // Bad: Tests internal state
   expect(component.state.isSuccess).toBe(true);
   ```

2. **Use accessible queries**

   ```typescript
   // Good
   screen.getByRole("button", { name: /submit/i });

   // Avoid
   screen.getByTestId("submit-btn");
   ```

3. **Test user interactions realistically**

   ```typescript
   // Good: Simulates real user
   await user.click(button);

   // Less ideal
   fireEvent.click(button);
   ```

4. **Keep tests focused**
   - One concept per test
   - Clear test names

### Don't ❌

1. Don't test library code (React, Tailwind, etc.)
2. Don't test implementation details
3. Don't write tests that are too coupled to the code
4. Don't skip tests without good reason

---

## What to Test

### Components

- Does it render correctly?
- Does it handle user interactions?
- Does it show correct states (loading, error, empty)?
- Is it accessible?

### Utility Functions

- Does it return correct output for given input?
- How does it handle edge cases?
- How does it handle errors?

### Hooks

- Does it return correct initial state?
- Does it update state correctly?
- Does it handle cleanup?

---

## Coverage

Run coverage report:

```bash
npm run test:coverage
```

Aim for:

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

Focus on critical paths first, not 100% coverage.

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
