/**
 * Script 01: Replace jest global with vi
 *
 * Replaces all jest.* global calls with vi.* equivalents.
 * Uses word boundary matching to avoid false positives.
 */

const RENAMES = [
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
  ['jest.runAllTimers', 'vi.runAllTimers'],
  ['jest.runOnlyPendingTimers', 'vi.runOnlyPendingTimers'],
  ['jest.setSystemTime', 'vi.setSystemTime'],
  ['jest.requireActual', 'vi.importActual'],
  ['jest.requireMock', 'vi.importMock'],
  ['jest.createMockFromModule', 'vi.mocked'],
  ['jest.enableAutomock', 'vi.mock'],
  ['jest.disableAutomock', 'vi.unmock'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function transform(root) {
  let content = root.root().text();

  for (const [oldCall, newCall] of RENAMES) {
    const regex = new RegExp(`\\b${escapeRegex(oldCall)}\\b`, 'g');
    content = content.replace(regex, newCall);
  }

  return content;
}
