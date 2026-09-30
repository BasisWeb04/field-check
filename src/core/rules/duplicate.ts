import type { BusinessRecord, Verdict } from "../types";
import { normalizePhone } from "./phone";
import { isBlank, verdict } from "./verdict";

/** Case, spacing, punctuation and "&" versus "and" differences do not make a different business. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function duplicateKey(record: BusinessRecord): string {
  return `${normalizeName(record.business_name)}|${normalizePhone(record.phone).digits}`;
}

/** One verdict per row (null when the name is blank); every member of a duplicate group is flagged. */
export function checkDuplicates(records: readonly BusinessRecord[]): (Verdict | null)[] {
  const groups = new Map<string, number[]>();
  records.forEach((r, i) => {
    if (isBlank(r.business_name)) return;
    const key = duplicateKey(r);
    groups.set(key, [...(groups.get(key) ?? []), i]);
  });
  return records.map((r, i) => {
    if (isBlank(r.business_name)) return null;
    const key = duplicateKey(r);
    const others = groups.get(key)!.filter((j) => j !== i).map((j) => records[j]!.id);
    const evidence = `key "${key}"`;
    if (others.length === 0) {
      return verdict("business_name", "duplicate", "pass", "No other row shares this normalized name and phone.", evidence);
    }
    return verdict("business_name", "duplicate", "fail", `Same normalized name and phone as row(s) ${others.join(", ")}.`, evidence);
  });
}
