import { RULE_SOURCES } from "../sources";
import type { FieldName, RuleId, Verdict, VerdictStatus } from "../types";

/** Builds a verdict with the rule's registered source, so no rule can emit one without a source. */
export function verdict(
  field: FieldName,
  ruleId: RuleId,
  status: VerdictStatus,
  message: string,
  evidence: string,
): Verdict {
  return { field, status, ruleId, message, evidence, source: RULE_SOURCES[ruleId] };
}

export function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}
