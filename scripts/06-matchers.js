/**
 * Script 06: Update custom matchers
 *
 * Replaces Jest-specific matcher patterns.
 */

export default function transform(root) {
  let content = root.root().text();

  // jest.setTimeout(N) → vi.setConfig({ testTimeout: N })
  content = content.replace(
    /\bjest\.setTimeout\s*\(\s*(\d+)\s*\)/g,
    'vi.setConfig({ testTimeout: $1 })'
  );

  // jest.retryTimes(N) → vi.retry(N)
  content = content.replace(
    /\bjest\.retryTimes\s*\(\s*(\d+)\s*\)/g,
    'vi.retry($1)'
  );

  return content;
}
