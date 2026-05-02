/**
 * Script 08: Final cleanup
 *
 * Adds vitest import if vi is used but not imported.
 */

export default function transform(root) {
  let content = root.root().text();

  // Check if vi is used
  if (!/\bvi\./.test(content)) {
    return content;
  }

  // Check if vitest is already imported
  if (/from\s+['"]vitest['"]/.test(content) || /import\s+['"]vitest['"]/.test(content)) {
    return content;
  }

  // Add vitest import at the top
  content = `import { vi } from 'vitest';\n\n${content}`;

  return content;
}
