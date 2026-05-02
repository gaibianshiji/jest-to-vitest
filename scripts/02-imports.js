/**
 * Script 02: Update imports
 *
 * Replaces @jest/globals with vitest imports.
 * Also replaces { jest } with { vi } in import destructuring.
 */

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

export default function transform(root) {
  let content = root.root().text();

  for (const [oldImport, newImport] of IMPORT_RENAMES) {
    const importRegex = new RegExp(
      `(from\\s+['"\`])${escapeRegex(oldImport)}(['"\`])`,
      'g'
    );
    content = content.replace(importRegex, `$1${newImport}$2`);
  }

  // Replace { jest } with { vi } in import destructuring from vitest
  content = content.replace(
    /(import\s*\{[^}]*\b)jest(\b[^}]*\}\s*from\s*['"]vitest['"])/g,
    '$1vi$2'
  );

  return content;
}
