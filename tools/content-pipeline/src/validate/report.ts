import type { Issue, ValidationResult } from './validate';

/** Human-readable report. Warnings are grouped by code unless `verbose`. */
export function formatReport(result: ValidationResult, verbose: boolean): string {
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const line = (i: Issue) =>
    `  ${i.file}${i.field ? ` › ${i.field}` : ''}: ${i.message}  [${i.code}]`;
  const out: string[] = [];
  const { counts } = result;
  out.push(
    `Checked ${counts.topics} topics, ${counts.clusters} trails, ${counts.concepts} concepts, ` +
      `${counts.variants} lesson variants, ${counts.questions} quiz questions, ${counts.sources} sources.`,
  );
  if (errors.length > 0) {
    out.push('', `✖ ${errors.length} error(s):`, ...errors.map(line));
  }
  if (warnings.length > 0) {
    out.push(
      '',
      `⚠ ${warnings.length} warning(s)${verbose ? ':' : ' (run with --verbose to list them all):'}`,
    );
    if (verbose) {
      out.push(...warnings.map(line));
    } else {
      const byCode = new Map<string, Issue[]>();
      for (const w of warnings) byCode.set(w.code, [...(byCode.get(w.code) ?? []), w]);
      for (const [code, list] of byCode) {
        const first = list[0];
        if (first)
          out.push(
            `  ${list.length} × [${code}] e.g. ${first.file}${first.field ? ` › ${first.field}` : ''}: ${first.message}`,
          );
      }
    }
  }
  out.push('', errors.length === 0 ? '✔ content:validate passed.' : '✖ content:validate failed.');
  return out.join('\n');
}
