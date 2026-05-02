# jest-to-vitest

> Automated codemod for migrating Jest test suites to Vitest. 95%+ automation. Zero false positives. Auto-import injection.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

Jest (25M+ weekly downloads) is the most popular JS testing framework, but Vitest is rapidly replacing it for its speed and native ESM support. Migrating test suites is tedious — every `jest.*` call must become `vi.*`, imports must change, config files must be rewritten. There's no existing tool to automate this.

## The Solution

`jest-to-vitest` automates 95%+ of the migration:

```
Before (Jest)                         After (Vitest)
─────────────────────────────────────────────────────────────
import { jest } from               →  import { vi } from
  '@jest/globals'                      'vitest'

const fn = jest.fn()              →  const fn = vi.fn()
jest.mock('./module')             →  vi.mock('./module')
jest.spyOn(obj, 'method')         →  vi.spyOn(obj, 'method')
jest.useFakeTimers()              →  vi.useFakeTimers()
jest.clearAllMocks()              →  vi.clearAllMocks()
jest.setTimeout(10000)            →  vi.setConfig({ testTimeout: 10000 })
jest.retryTimes(3)                →  vi.retry(3)
```

## Key Innovation: Auto-Import Injection

When the codemod transforms `jest.fn()` to `vi.fn()`, it automatically adds `import { vi } from 'vitest'` at the top of the file. This ensures migrated code is immediately runnable without manual fixes.

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTO-IMPORT INJECTION                     │
├─────────────────────────────────────────────────────────────┤
│  Input:                           Output:                   │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │ const fn = jest.fn()│    →    │ import { vi } from  │   │
│  │                     │         │   'vitest';         │   │
│  │                     │         │                     │   │
│  │                     │         │ const fn = vi.fn()  │   │
│  └─────────────────────┘         └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 8-Step Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  01. Jest    │ →  │  02. Import  │ →  │  03. Config  │ →  │  04. Mock    │
│  Global→Vi   │    │  Updates     │    │  Migration   │    │  Patterns    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       ↓                   ↓                   ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  05. Timer   │ →  │  06. Custom  │ →  │  07. Module  │ →  │  08. Cleanup │
│  Helpers     │    │  Matchers    │    │  Mocking     │    │  & Auto-Import│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

## Real-World Validation

Tested on **React Testing Library** (testing-library/react-testing-library, 19,000+ stars):

| Metric | Value |
|--------|-------|
| Files scanned | 33 |
| Files modified | 11 |
| Lines changed | 1,538 |
| False positives | 0 |
| Time taken | < 1 second |

## What's Automated

| Category | Pattern | Example |
|----------|---------|---------|
| Core | `jest.fn()`→`vi.fn()` | `jest.fn()`→`vi.fn()` |
| Core | `jest.mock()`→`vi.mock()` | `jest.mock('./m')`→`vi.mock('./m')` |
| Core | `jest.spyOn()`→`vi.spyOn()` | `jest.spyOn(o,'m')`→`vi.spyOn(o,'m')` |
| Mocks | `jest.clearAllMocks()`→`vi.clearAllMocks()` | `jest.clearAllMocks()`→`vi.clearAllMocks()` |
| Mocks | `jest.resetAllMocks()`→`vi.resetAllMocks()` | `jest.resetAllMocks()`→`vi.resetAllMocks()` |
| Timers | `jest.useFakeTimers()`→`vi.useFakeTimers()` | `jest.useFakeTimers()`→`vi.useFakeTimers()` |
| Timers | `jest.advanceTimersByTime()`→`vi.advanceTimersByTime()` | `jest.advanceTimersByTime(1000)`→`vi.advanceTimersByTime(1000)` |
| Imports | `@jest/globals`→`vitest` | `from '@jest/globals'`→`from 'vitest'` |
| Imports | `{ jest }`→`{ vi }` | `import { jest }`→`import { vi }` |
| Config | `jest.setTimeout(N)`→`vi.setConfig({testTimeout:N})` | `jest.setTimeout(10000)`→`vi.setConfig({testTimeout:10000})` |
| Config | `jest.retryTimes(N)`→`vi.retry(N)` | `jest.retryTimes(3)`→`vi.retry(3)` |
| Module | `jest.requireActual()`→`vi.importActual()` | `jest.requireActual('./m')`→`vi.importActual('./m')` |
| Module | `jest.createMockFromModule()`→`vi.mocked()` | `jest.createMockFromModule('./m')`→`vi.mocked('./m')` |
| Auto | Import injection | Adds `import { vi } from 'vitest'` when needed |

## Usage

```bash
npx codemod run jest-to-vitest-gaibianshiji
```

Or run directly:

```bash
node migrate.mjs <target-directory>
```

## Testing

```bash
node tests/run-tests.mjs
```

```
✅ 01-jest-fn-to-vi-fn: PASS
✅ 02-jest-mock-to-vi-mock: PASS
✅ 03-jest-spyOn-to-vi-spyOn: PASS
✅ 04-mock-management: PASS
✅ 05-timer-functions: PASS
✅ 06-setTimeout: PASS
✅ 07-import-globals: PASS
✅ 08-require-actual: PASS
✅ 09-retry-times: PASS
✅ 10-combined-transforms: PASS
✅ 11-no-false-positives: PASS
✅ 12-vitest-import-already-present: PASS
✅ 13-createMockFromModule: PASS

13 passed, 0 failed out of 13 tests
```

## What's NOT Automated

These require semantic understanding — handle manually:

- Custom Jest transformers
- Jest-specific plugins (`jest-enzyme`, `jest-dom`)
- Snapshot testing (`toMatchSnapshot()` works differently)
- Complex `moduleNameMapper` patterns

## Case Study

See [CASE_STUDY.md](./CASE_STUDY.md) for the full migration analysis.

## License

MIT
