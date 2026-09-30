import { toCsv } from "./csv";
import { RULE_SOURCES } from "./sources";
import type { RunResult } from "./types";

export function toResultsJson(result: RunResult): string {
  return JSON.stringify(
    {
      summary: result.summary,
      sources: RULE_SOURCES,
      rows: result.rows.map((r) => ({
        id: r.record.id,
        rowNumber: r.rowNumber,
        status: r.status,
        counts: r.counts,
        record: r.record,
        verdicts: r.verdicts,
      })),
    },
    null,
    2,
  );
}

/** One line per verdict so the file filters cleanly in a spreadsheet. */
export function toResultsCsv(result: RunResult): string {
  const header = ["id", "row_status", "field", "rule_id", "status", "message", "evidence", "source"];
  const lines = result.rows.flatMap((r) =>
    r.verdicts.map((v) => [r.record.id, r.status, v.field, v.ruleId, v.status, v.message, v.evidence, v.source]),
  );
  return toCsv([header, ...lines]);
}

export function formatSummary(result: RunResult): string {
  const s = result.summary;
  const pad = (label: string, n: number) => `  ${label.padEnd(22)}${String(n).padStart(5)}`;
  const failing = Object.entries(s.failsByRule).filter(([, n]) => n > 0);
  return [
    "Field Check summary",
    pad("rows", s.rows),
    pad("verified", s.verified),
    pad("partly verified", s.partlyVerified),
    pad("needs review", s.needsReview),
    "verdicts",
    pad("pass", s.verdicts.pass),
    pad("unverifiable", s.verdicts.unverifiable),
    pad("fail", s.verdicts.fail),
    "fails by rule",
    ...(failing.length ? failing.map(([id, n]) => pad(id, n)) : ["  none"]),
  ].join("\n");
}
