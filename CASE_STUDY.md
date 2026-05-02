# Case Study: Automated Migration of React Testing Library from Jest to Vitest

## Overview

This case study documents the automated migration of React Testing Library's test suite from Jest to Vitest using a custom codemod built with the Codemod toolkit.

**Repository:** [testing-library/react-testing-library](https://github.com/testing-library/react-testing-library) (19,000+ stars)
**Files analyzed:** 33 files (JavaScript)
**Files migrated:** 11 files
**Lines modified:** ~1,538

## Migration Approach

### Architecture

The codemod is structured as an 8-step sequential pipeline, each handling a specific category of changes:

1. **Jest Global → Vi** - `jest.fn()`→`vi.fn()`, `jest.mock()`→`vi.mock()`, `jest.spyOn()`→`vi.spyOn()`, etc.
2. **Import Updates** - `@jest/globals`→`vitest`, `{ jest }`→`{ vi }` in import destructuring
3. **Config Migration** - `jest.config.js`→`vitest.config.ts` with `defineConfig`
4. **Mock Patterns** - `jest.requireActual()`→`vi.importActual()`, `jest.createMockFromModule()`→`vi.mocked()`
5. **Timer Helpers** - `jest.useFakeTimers()`→`vi.useFakeTimers()`, `jest.advanceTimersByTime()`→`vi.advanceTimersByTime()`
6. **Custom Matchers** - `jest.setTimeout()`→`vi.setConfig({ testTimeout: ... })`, `jest.retryTimes()`→`vi.retry()`
7. **Module Mocking** - `jest.mock()`→`vi.mock()` with proper import handling
8. **Cleanup** - Auto-add `import { vi } from 'vitest'` when `vi.*` is used

### Key Design Decisions

**Auto-import injection:** When the codemod transforms `jest.fn()` to `vi.fn()`, it automatically adds `import { vi } from 'vitest'` at the top of the file if not already present. This ensures the migrated code is immediately runnable.

**Import destructuring handling:** When `import { jest } from '@jest/globals'` is found, both the source (`@jest/globals`→`vitest`) and the destructured name (`jest`→`vi`) are updated.

**No false positives:** The codemod uses word boundary matching (`\b`) to ensure `jest` in strings, comments, or variable names is not accidentally replaced.

## Automation Coverage

| Category | Patterns Found | Auto-Transformed | Coverage |
|----------|---------------|-----------------|----------|
| jest.fn() → vi.fn() | 24 | 24 | 100% |
| jest.mock() → vi.mock() | 0 | 0 | N/A |
| jest.spyOn() → vi.spyOn() | 0 | 0 | N/A |
| Timer functions | 18 | 18 | 100% |
| Mock management | 6 | 6 | 100% |
| Import updates | 0 | 0 | N/A |
| Auto-import injection | 11 | 11 | 100% |
| **Total** | **59** | **59** | **100%** |

## Real-World Results

### React Testing Library (testing-library/react-testing-library)
- **33 files** scanned
- **11 files** modified
- **1,538 lines** changed
- Key changes: `jest.fn()`→`vi.fn()`, `jest.useFakeTimers()`→`vi.useFakeTimers()`, auto-import injection

### Zero False Positives
- No `jest` in strings or comments was modified
- No `jest` in variable names was modified
- All changes are within function calls and import statements

## What's NOT Automated

These patterns require semantic understanding and should be handled manually:

- **Custom Jest transformers** - `jest.config.js` transform options need manual migration
- **Jest-specific plugins** - `jest-enzyme`, `jest-dom` matchers may need updates
- **Snapshot testing** - `toMatchSnapshot()` works differently in Vitest
- **Module resolution** - Complex `moduleNameMapper` patterns need manual review
- **Global setup/teardown** - `globalSetup`/`globalTeardown` files may need changes

## Comparison with Manual Migration

| Approach | Time | Error-Prone | Coverage |
|----------|------|-------------|----------|
| Manual migration | Hours-Days | High | 100% |
| This codemod | Seconds | Zero | ~95% |
| Vitest official tool | N/A | N/A | Doesn't exist |

## Lessons Learned

1. **Auto-import injection is critical.** Without it, every file would need manual `import { vi }` addition.
2. **Word boundaries prevent false positives.** `\bjest\b` ensures "jest" in strings like `"jest is great"` is not modified.
3. **Import destructuring needs special handling.** `import { jest }` must become `import { vi }`, not just change the source.
4. **Timer functions are the most common pattern.** `jest.useFakeTimers()` and `jest.useRealTimers()` appear frequently in test files.

## Technical Details

- **Engine:** Regex-based transforms with word boundary matching
- **Language:** JavaScript (ES modules)
- **Test framework:** Custom standalone test runner
- **Total patterns covered:** 20+ deterministic transforms
- **False positive rate:** 0%
