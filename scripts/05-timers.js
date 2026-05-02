/**
 * Script 05: Update timer helpers
 *
 * Replaces jest timer methods with vi equivalents.
 */

export default function transform(root) {
  let content = root.root().text();

  // jest.useFakeTimers → vi.useFakeTimers
  content = content.replace(/\bjest\.useFakeTimers\b/g, 'vi.useFakeTimers');

  // jest.useRealTimers → vi.useRealTimers
  content = content.replace(/\bjest\.useRealTimers\b/g, 'vi.useRealTimers');

  // jest.advanceTimersByTime → vi.advanceTimersByTime
  content = content.replace(/\bjest\.advanceTimersByTime\b/g, 'vi.advanceTimersByTime');

  // jest.runAllTimers → vi.runAllTimers
  content = content.replace(/\bjest\.runAllTimers\b/g, 'vi.runAllTimers');

  // jest.runOnlyPendingTimers → vi.runOnlyPendingTimers
  content = content.replace(/\bjest\.runOnlyPendingTimers\b/g, 'vi.runOnlyPendingTimers');

  // jest.setSystemTime → vi.setSystemTime
  content = content.replace(/\bjest\.setSystemTime\b/g, 'vi.setSystemTime');

  return content;
}
