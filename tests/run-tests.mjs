#!/usr/bin/env node
/**
 * Test runner for Jest → Vitest codemod
 */

// ============================================================
// TRANSFORM FUNCTIONS (same as migrate.mjs)
// ============================================================

const JEST_GLOBAL_RENAMES = [
  ['jest.fn', 'vi.fn'],
  ['jest.mock', 'vi.mock'],
  ['jest.spyOn', 'vi.spyOn'],
  ['jest.unmock', 'vi.unmock'],
  ['jest.clearAllMocks', 'vi.clearAllMocks'],
  ['jest.resetAllMocks', 'vi.resetAllMocks'],
  ['jest.restoreAllMocks', 'vi.restoreAllMocks'],
  ['jest.useFakeTimers', 'vi.useFakeTimers'],
  ['jest.useRealTimers', 'vi.useRealTimers'],
  ['jest.advanceTimersByTime', 'vi.advanceTimersByTime'],
  ['jest.advanceTimersToNextTimer', 'vi.advanceTimersToNextTimer'],
  ['jest.runAllTimers', 'vi.runAllTimers'],
  ['jest.runOnlyPendingTimers', 'vi.runOnlyPendingTimers'],
  ['jest.setSystemTime', 'vi.setSystemTime'],
  ['jest.getRealSystemTime', 'vi.getRealSystemTime'],
  ['jest.requireActual', 'vi.importActual'],
  ['jest.requireMock', 'vi.importMock'],
  ['jest.createMockFromModule', 'vi.mocked'],
  ['jest.enableAutomock', 'vi.mock'],
  ['jest.disableAutomock', 'vi.unmock'],
  ['jest.now', 'vi.now'],
];

const IMPORT_RENAMES = [
  ['@jest/globals', 'vitest'],
  ['@jest/types', 'vitest'],
  ['@jest/environment', 'vitest'],
  ['jest-environment-jsdom', 'vitest/jsdom'],
  ['jest-environment-node', 'vitest/node'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceJestGlobals(content) {
  let result = content;
  for (const [oldCall, newCall] of JEST_GLOBAL_RENAMES) {
    const regex = new RegExp(`\\b${escapeRegex(oldCall)}\\b`, 'g');
    result = result.replace(regex, newCall);
  }
  return result;
}

function replaceImports(content) {
  let result = content;
  for (const [oldImport, newImport] of IMPORT_RENAMES) {
    const importRegex = new RegExp(
      `(from\\s+['"\`])${escapeRegex(oldImport)}(['"\`])`,
      'g'
    );
    result = result.replace(importRegex, `$1${newImport}$2`);
  }
  // Replace { jest } with { vi } in import destructuring from vitest
  result = result.replace(
    /(import\s*\{[^}]*\b)jest(\b[^}]*\}\s*from\s*['"]vitest['"])/g,
    '$1vi$2'
  );
  return result;
}

function updateSetTimeout(content) {
  return content.replace(
    /\bjest\.setTimeout\s*\(\s*(\d+)\s*\)/g,
    'vi.setConfig({ testTimeout: $1 })'
  );
}

function updateRetryTimes(content) {
  return content.replace(
    /\bjest\.retryTimes\s*\(\s*(\d+)\s*\)/g,
    'vi.retry($1)'
  );
}

function updateCreateMockFromModule(content) {
  return content.replace(
    /\bjest\.createMockFromModule\s*\(/g,
    'vi.mocked('
  );
}

function addVitestImportIfNeeded(content) {
  if (!/\bvi\./.test(content)) return content;
  if (/from\s+['"]vitest['"]/.test(content)) return content;
  if (/import\s+['"]vitest['"]/.test(content)) return content;
  return `import { vi } from 'vitest';\n\n${content}`;
}

function applyAllTransforms(content) {
  let result = content;
  result = replaceJestGlobals(result);
  result = replaceImports(result);
  result = updateSetTimeout(result);
  result = updateRetryTimes(result);
  result = updateCreateMockFromModule(result);
  result = addVitestImportIfNeeded(result);
  return result;
}

// ============================================================
// TEST SUITES
// ============================================================

const tests = [
  {
    name: '01-jest-fn-to-vi-fn',
    input: `const mockFn = jest.fn();
const mockFnWithImpl = jest.fn(() => 'hello');`,
    expected: `import { vi } from 'vitest';

const mockFn = vi.fn();
const mockFnWithImpl = vi.fn(() => 'hello');`,
  },
  {
    name: '02-jest-mock-to-vi-mock',
    input: `jest.mock('./module');
jest.mock('./other-module', () => ({
  default: jest.fn(),
}));`,
    expected: `import { vi } from 'vitest';

vi.mock('./module');
vi.mock('./other-module', () => ({
  default: vi.fn(),
}));`,
  },
  {
    name: '03-jest-spyOn-to-vi-spyOn',
    input: `const spy = jest.spyOn(obj, 'method');
spy.mockReturnValue('mocked');`,
    expected: `import { vi } from 'vitest';

const spy = vi.spyOn(obj, 'method');
spy.mockReturnValue('mocked');`,
  },
  {
    name: '04-mock-management',
    input: `afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});`,
    expected: `import { vi } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});`,
  },
  {
    name: '05-timer-functions',
    input: `jest.useFakeTimers();
jest.advanceTimersByTime(1000);
jest.runAllTimers();
jest.runOnlyPendingTimers();
jest.useRealTimers();`,
    expected: `import { vi } from 'vitest';

vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.runAllTimers();
vi.runOnlyPendingTimers();
vi.useRealTimers();`,
  },
  {
    name: '06-setTimeout',
    input: `jest.setTimeout(30000);`,
    expected: `import { vi } from 'vitest';

vi.setConfig({ testTimeout: 30000 });`,
  },
  {
    name: '07-import-globals',
    input: `import { jest, describe, it, expect } from '@jest/globals';`,
    expected: `import { vi, describe, it, expect } from 'vitest';`,
  },
  {
    name: '08-require-actual',
    input: `const actual = jest.requireActual('./module');
const mock = jest.requireMock('./module');`,
    expected: `import { vi } from 'vitest';

const actual = vi.importActual('./module');
const mock = vi.importMock('./module');`,
  },
  {
    name: '09-retry-times',
    input: `jest.retryTimes(3);`,
    expected: `import { vi } from 'vitest';

vi.retry(3);`,
  },
  {
    name: '10-combined-transforms',
    input: `import { jest } from '@jest/globals';

jest.mock('./utils');
jest.setTimeout(10000);

const mockFn = jest.fn();
const spy = jest.spyOn(console, 'log');

afterEach(() => {
  jest.clearAllMocks();
});`,
    expected: `import { vi } from 'vitest';

vi.mock('./utils');
vi.setConfig({ testTimeout: 10000 });

const mockFn = vi.fn();
const spy = vi.spyOn(console, 'log');

afterEach(() => {
  vi.clearAllMocks();
});`,
  },
  {
    name: '11-no-false-positives',
    input: `// This comment mentions jest but should not be changed
const message = "jest is great";
const config = { testRunner: 'jest' };`,
    expected: `// This comment mentions jest but should not be changed
const message = "jest is great";
const config = { testRunner: 'jest' };`,
  },
  {
    name: '12-vitest-import-already-present',
    input: `import { vi, describe, it, expect } from 'vitest';

const mockFn = vi.fn();`,
    expected: `import { vi, describe, it, expect } from 'vitest';

const mockFn = vi.fn();`,
  },
  {
    name: '13-createMockFromModule',
    input: `const mockModule = jest.createMockFromModule('./module');`,
    expected: `import { vi } from 'vitest';

const mockModule = vi.mocked('./module');`,
  },
];

// ============================================================
// TEST RUNNER
// ============================================================

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = applyAllTransforms(test.input);

  if (result === test.expected) {
    console.log(`✅ ${test.name}: PASS`);
    passed++;
  } else {
    console.log(`❌ ${test.name}: FAIL`);
    console.log(`  Expected:`);
    test.expected.split('\n').forEach(l => console.log(`    ${l}`));
    console.log(`  Got:`);
    result.split('\n').forEach(l => console.log(`    ${l}`));

    // Show line diff
    const expectedLines = test.expected.split('\n');
    const resultLines = result.split('\n');
    for (let i = 0; i < Math.max(expectedLines.length, resultLines.length); i++) {
      if (expectedLines[i] !== resultLines[i]) {
        console.log(`  Line ${i + 1}:`);
        console.log(`    Expected: ${expectedLines[i]}`);
        console.log(`    Got:      ${resultLines[i]}`);
      }
    }
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed > 0) {
  process.exit(1);
}
