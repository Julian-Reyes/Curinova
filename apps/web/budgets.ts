import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/*
 * Size budgets (§15, D28), in compressed (gzip) bytes, checked at the end of every build:
 * the build fails over any of them. They sit a little above today's sizes (2026-11-13:
 * 277 KB of JavaScript, largest file 64 KB, CSS 14 KB, largest public page 6 KB), so growth
 * is a decision rather than an accident. The starter pack's 3 MB is enforced by
 * content:build, which picks the pack to fit.
 */
export const BUDGETS = {
  /** All of the app's JavaScript (what a full first visit can download). */
  appJs: 320 * 1024,
  /** Any single JavaScript file. */
  jsFile: 100 * 1024,
  /** All stylesheets. */
  css: 25 * 1024,
  /** Any public page's HTML; public pages load no JavaScript. */
  publicPage: 15 * 1024,
} as const;

const gzip = (file: string) => gzipSync(readFileSync(file)).length;
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

/** Checks the built client against the budgets; `pages` are public page paths like /en/credits/. */
export function checkBudgets(
  clientDir: string,
  pages: string[],
  budgets: typeof BUDGETS = BUDGETS,
): { problems: string[]; report: string[] } {
  const problems: string[] = [];
  const assets = readdirSync(join(clientDir, 'assets'));
  const sizes = (ext: string) =>
    assets
      .filter((f) => f.endsWith(ext))
      .map((f) => [f, gzip(join(clientDir, 'assets', f))] as const);
  const js = sizes('.js');
  const css = sizes('.css');
  const total = (list: (readonly [string, number])[]) => list.reduce((n, [, b]) => n + b, 0);
  const largest = (list: (readonly [string, number])[]) =>
    list.reduce<readonly [string, number]>((max, x) => (x[1] > max[1] ? x : max), ['', 0]);

  const [jsName, jsMax] = largest(js);
  const page = largest(pages.map((p) => [p, gzip(join(clientDir, p, 'index.html'))] as const));
  const rows: [string, number, number, string][] = [
    ['app JavaScript', total(js), budgets.appJs, `${String(js.length)} files`],
    ['largest JavaScript file', jsMax, budgets.jsFile, jsName],
    ['stylesheets', total(css), budgets.css, `${String(css.length)} files`],
    ['largest public page', page[1], budgets.publicPage, page[0]],
  ];
  const report = rows.map(
    ([what, bytes, budget, note]) => `${what}: ${kb(bytes)} of ${kb(budget)} (${note})`,
  );
  for (const [what, bytes, budget, note] of rows)
    if (bytes > budget)
      problems.push(`${what} is ${kb(bytes)}, over its ${kb(budget)} budget (${note})`);
  return { problems, report };
}
