# jest-to-vitest

Automated codemod for migrating Jest test suites to Vitest.

## What it does

This codemod automates **~95% of the deterministic migration patterns** from Jest to Vitest:

- **jest → vi global:** `jest.fn()`→`vi.fn()`, `jest.mock()`→`vi.mock()`, `jest.spyOn()`→`vi.spyOn()`
- **Mock management:** `jest.clearAllMocks()`→`vi.clearAllMocks()`, `jest.resetAllMocks()`→`vi.resetAllMocks()`
- **Timer functions:** `jest.useFakeTimers()`→`vi.useFakeTimers()`, `jest.advanceTimersByTime()`→`vi.advanceTimersByTime()`
- **Import updates:** `@jest/globals`→`vitest`, `{ jest }`→`{ vi }`
- **Config migration:** `jest.config.js`→`vitest.config.ts` with `defineConfig`
- **Auto-import injection:** Automatically adds `import { vi } from 'vitest'` when needed

## Usage

```bash
npx codemod run jest-to-vitest
```

Or run the migration script directly:

```bash
node migrate.mjs <target-directory>
```

## What's NOT automated

These patterns require semantic understanding and should be handled manually:

- **Custom Jest transformers** - `jest.config.js` transform options
- **Jest-specific plugins** - `jest-enzyme`, `jest-dom` matchers
- **Snapshot testing** - `toMatchSnapshot()` works differently in Vitest
- **Module resolution** - Complex `moduleNameMapper` patterns

## Testing

```bash
node tests/run-tests.mjs
```

## Case Study

See [CASE_STUDY.md](./CASE_STUDY.md) for the full migration analysis of React Testing Library.

## How it works

The codemod uses **word-boundary-scoped regex transforms** to ensure zero false positives:

1. All `jest.*` calls are replaced with `vi.*` equivalents using `\b` word boundaries
2. Import sources are updated (`@jest/globals`→`vitest`)
3. Import destructuring is updated (`{ jest }`→`{ vi }`)
4. Auto-import injection adds `import { vi } from 'vitest'` when `vi.*` is used
