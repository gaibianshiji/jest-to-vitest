/**
 * Script 04: Update mock patterns
 *
 * Replaces jest.mock/requireActual/importActual patterns.
 */

export default function transform(root) {
  let content = root.root().text();

  // jest.requireActual → vi.importActual
  content = content.replace(/\bjest\.requireActual\s*\(/g, 'vi.importActual(');

  // jest.requireMock → vi.importMock
  content = content.replace(/\bjest\.requireMock\s*\(/g, 'vi.importMock(');

  // jest.createMockFromModule → vi.mocked
  content = content.replace(/\bjest\.createMockFromModule\s*\(/g, 'vi.mocked(');

  return content;
}
