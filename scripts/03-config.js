/**
 * Script 03: Migrate config files
 *
 * Converts jest.config.js/ts to vitest.config.ts equivalents.
 */

export default function transform(root) {
  let content = root.root().text();

  // Replace module.exports with defineConfig
  content = content.replace(
    /module\.exports\s*=\s*\{/g,
    'import { defineConfig } from "vitest/config";\nexport default defineConfig({\n  test: {'
  );

  // Replace export default with defineConfig
  content = content.replace(
    /export\s+default\s*\{/g,
    'import { defineConfig } from "vitest/config";\nexport default defineConfig({\n  test: {'
  );

  // Replace testEnvironment with environment
  content = content.replace(
    /testEnvironment\s*:\s*['"]jsdom['"]/g,
    "environment: 'jsdom'"
  );
  content = content.replace(
    /testEnvironment\s*:\s*['"]node['"]/g,
    "environment: 'node'"
  );

  return content;
}
