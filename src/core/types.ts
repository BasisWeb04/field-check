export const FIELDS = [
  "business_name",
  "phone",
  "email",
  "website",
  "street",
  "city",
  "state",
  "zip",
  "hours",
] as const;

export type FieldName = (typeof FIELDS)[number];

export const INPUT_COLUMNS = ["id", ...FIELDS] as const;

export type BusinessRecord = { id: string } & Record<FieldName, string>;

export type VerdictStatus = "pass" | "fail" | "unverifiable";

export const RULE_IDS = [
  "required",
  "phone.nanp",
  "email.syntax",
  "website.syntax",
  "email.domain-match",
  "zip.format",
  "zip.state",
  "hours.parse",
  "duplicate",
] as const;

export type RuleId = (typeof RULE_IDS)[number];

export interface Verdict {
  field: FieldName;
  status: VerdictStatus;
  ruleId: RuleId;
  message: string;
  evidence: string;
  source: string;
}

export type RowStatus = "verified" | "partly verified" | "needs review";

export type StatusCounts = Record<VerdictStatus, number>;

export interface RowResult {
  rowNumber: number;
  record: BusinessRecord;
  verdicts: Verdict[];
  counts: StatusCounts;
  status: RowStatus;
}

export interface Summary {
  rows: number;
  verified: number;
  partlyVerified: number;
  needsReview: number;
  verdicts: StatusCounts;
  failsByRule: Record<RuleId, number>;
}

export interface RunResult {
  rows: RowResult[];
  summary: Summary;
}
