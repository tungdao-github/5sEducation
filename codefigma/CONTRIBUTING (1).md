# Contributing to EduCourse

First off, thank you for considering contributing to EduCourse! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful and constructive
- Focus on what is best for the community

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0
- Git

### Setup

1. **Fork the repository**

Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

```bash
git clone https://github.com/YOUR_USERNAME/educourse.git
cd educourse
```

3. **Add upstream remote**

```bash
git remote add upstream https://github.com/educourse/educourse.git
```

4. **Install dependencies**

```bash
npm install
```

5. **Create a branch**

```bash
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### 1. Keep your fork synced

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make your changes

- Write clean, maintainable code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 4. Test your changes

```bash
npm run type-check    # TypeScript check
npm run lint          # Linting
npm run test          # Run tests
npm run build         # Production build
```

### 5. Commit your changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Convention](#commit-convention) for commit message format.

### 6. Push to your fork

```bash
git push origin feature/amazing-feature
```

### 7. Create a Pull Request

Go to the original repository and click "New Pull Request".

---

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` types - use `unknown` or proper types
- Define interfaces for all complex objects
- Use type inference where possible
- Prefer `interface` over `type` for object shapes

```typescript
// Good ✅
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid ❌
const user: any = { ... };
```

### React

- Use functional components only
- Use hooks for state and side effects
- Keep components small and focused (< 200 lines)
- Extract complex logic to custom hooks
- Use proper prop types

```tsx
// Good ✅
interface Props {
  title: string;
  onSave: () => void;
}

export function Component({ title, onSave }: Props) {
  // ...
}

// Avoid ❌
export function Component(props: any) {
  // ...
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `PascalCase.ts` or `index.ts`
- Constants: `UPPER_SNAKE_CASE.ts`

### Code Organization

```
src/
├── app/
│   ├── components/      # React components
│   ├── contexts/        # Context providers
│   ├── pages/           # Route pages
│   └── data/            # Mock data
├── hooks/               # Custom hooks
├── lib/                 # Core libraries
├── types/               # TypeScript types
└── utils/               # Helper functions
```

### Imports

Order imports by:
1. External libraries
2. Internal modules
3. Relative imports
4. Types
5. Styles

```typescript
// Good ✅
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './components/ui/button';
import { formatDate } from '../utils';
import type { User } from '../types';
import './styles.css';
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semi colons, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools
- `ci`: CI/CD changes

### Examples

```bash
feat: add course comparison feature
fix: resolve cart calculation bug
docs: update README installation steps
style: format code with prettier
refactor: extract auth logic to custom hook
perf: optimize image loading with lazy loading
test: add unit tests for course service
chore: update dependencies
ci: add GitHub Actions workflow
```

### Scope (optional)

```bash
feat(auth): add social login
fix(cart): resolve quantity update issue
docs(api): update API documentation
```

---

## Pull Request Process

### Before Submitting

1. ✅ Run all checks:
   ```bash
   npm run type-check
   npm run lint
   npm run format:check
   npm run build
   ```

2. ✅ Update documentation if needed
3. ✅ Add tests for new features
4. ✅ Ensure all tests pass
5. ✅ Update CHANGELOG.md

### PR Title

Follow the same convention as commit messages:

```
feat: add course comparison feature
fix: resolve cart total calculation
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] CHANGELOG.md updated
```

### Review Process

- At least 1 approval required
- All CI checks must pass
- No merge conflicts
- Code review comments addressed

---

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils';

describe('formatCurrency', () => {
  it('should format VND currency correctly', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000 ₫');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('0 ₫');
  });
});
```

### Integration Tests

Test component interactions and API calls.

### E2E Tests

Test user flows with Playwright.

```typescript
import { test, expect } from '@playwright/test';

test('user can add course to cart', async ({ page }) => {
  await page.goto('/course/1');
  await page.click('button:has-text("Thêm vào giỏ")');
  await expect(page.locator('.cart-count')).toHaveText('1');
});
```

---

## Documentation

### Code Comments

- Add JSDoc comments for complex functions
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Calculate discount amount based on coupon type
 * @param originalPrice - The original price before discount
 * @param coupon - The coupon object containing type and value
 * @returns The calculated discount amount
 */
function calculateDiscount(originalPrice: number, coupon: Coupon): number {
  // Implementation
}
```

### README Updates

Update README.md when adding:
- New features
- Configuration options
- Dependencies
- Setup steps

---

## Questions?

Feel free to:
- Open an issue
- Ask in Discussions
- Email: dev@educourse.vn

---

Thank you for contributing! 🚀
