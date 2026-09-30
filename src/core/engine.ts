import { toRecords } from "./csv";
import { checkDomainMatch } from "./rules/domainMatch";
import { checkDuplicates } from "./rules/duplicate";
import { checkEmail } from "./rules/email";
import { checkHours } from "./rules/hours";
import { checkPhone } from "./rules/phone";
import { checkRequired } from "./rules/required";
import { checkWebsite } from "./rules/website";
import { checkZipFormat, checkZipState } from "./rules/zip";
import {
  FIELDS,
  RULE_IDS,
  type BusinessRecord,
  type RowResult,
  type RowStatus,
  type RuleId,
  type RunResult,
  type StatusCounts,
  type Summary,
  type Verdict,
} from "./types";

/** Every single-row rule; a null result means the rule does not apply (for example, the value is blank). */
function rowVerdicts(r: BusinessRecord): Verdict[] {
  const candidates: (Verdict | null)[] = [
    ...checkRequired(r),
    checkPhone(r.phone),
    checkEmail(r.email),
    checkWebsite(r.website),
    checkDomainMatch(r.email, r.website),
    checkZipFormat(r.zip),
    checkZipState(r.zip, r.state),
    checkHours(r.hours),
  ];
  return candidates.filter((v): v is Verdict => v !== null);
}

export function countStatuses(verdicts: readonly Verdict[]): StatusCounts {
  const counts: StatusCounts = { pass: 0, fail: 0, unverifiable: 0 };
  for (const v of verdicts) counts[v.status]++;
  return counts;
}

/** Any fail needs review; only an all-pass row is verified; anything else is partly verified. */
export function rowStatus(counts: StatusCounts): RowStatus {
  if (counts.fail > 0) return "needs review";
  if (counts.unverifiable === 0) return "verified";
  return "partly verified";
}

const FIELD_ORDER = new Map(FIELDS.map((f, i) => [f, i]));

export function verifyRecords(records: readonly BusinessRecord[]): RunResult {
  const dupes = checkDuplicates(records);
  const rows: RowResult[] = records.map((record, i) => {
    const verdicts = [...rowVerdicts(record), dupes[i]]
      .filter((v): v is Verdict => v !== null && v !== undefined)
      .sort((a, b) => FIELD_ORDER.get(a.field)! - FIELD_ORDER.get(b.field)!);
    const counts = countStatuses(verdicts);
    return { rowNumber: i + 1, record, verdicts, counts, status: rowStatus(counts) };
  });
  return { rows, summary: summarize(rows) };
}

export function verifyCsv(text: string): RunResult {
  return verifyRecords(toRecords(text));
}

export function summarize(rows: readonly RowResult[]): Summary {
  const failsByRule = Object.fromEntries(RULE_IDS.map((id) => [id, 0])) as Record<RuleId, number>;
  const verdicts: StatusCounts = { pass: 0, fail: 0, unverifiable: 0 };
  for (const row of rows) {
    for (const v of row.verdicts) {
      verdicts[v.status]++;
      if (v.status === "fail") failsByRule[v.ruleId]++;
    }
  }
  return {
    rows: rows.length,
    verified: rows.filter((r) => r.status === "verified").length,
    partlyVerified: rows.filter((r) => r.status === "partly verified").length,
    needsReview: rows.filter((r) => r.status === "needs review").length,
    verdicts,
    failsByRule,
  };
}

/** Worst status wins for a table cell: fail, then unverifiable, then pass. */
export function cellStatus(verdicts: readonly Verdict[]): Verdict["status"] | null {
  if (verdicts.length === 0) return null;
  if (verdicts.some((v) => v.status === "fail")) return "fail";
  if (verdicts.some((v) => v.status === "unverifiable")) return "unverifiable";
  return "pass";
}
