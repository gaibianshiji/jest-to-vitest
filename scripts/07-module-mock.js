/**
 * Script 07: Update module mocking
 *
 * Replaces jest.mock() module patterns with vi.mock().
 */

export default function transform(root) {
  let content = root.root().text();

  // jest.mock → vi.mock
  content = content.replace(/\bjest\.mock\b/g, 'vi.mock');

  // jest.unmock → vi.unmock
  content = content.replace(/\bjest\.unmock\b/g, 'vi.unmock');

  // jest.enableAutomock → vi.mock
  content = content.replace(/\bjest\.enableAutomock\b/g, 'vi.mock');

  // jest.disableAutomock → vi.unmock
  content = content.replace(/\bjest\.disableAutomock\b/g, 'vi.unmock');

  return content;
}
