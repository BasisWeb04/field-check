import type { RowStatus, VerdictStatus } from "../core/types";

/** Text markers so status never relies on color alone. */
export const STATUS_TAG: Record<VerdictStatus, string> = {
  pass: "PASS",
  fail: "FAIL",
  unverifiable: "UNV",
};

export const STATUS_WORD: Record<VerdictStatus, string> = {
  pass: "pass",
  fail: "fail",
  unverifiable: "unverifiable",
};

export const CELL_CLASS: Record<VerdictStatus, string> = {
  pass: "border-l-emerald-600 bg-emerald-50 text-emerald-950 dark:border-l-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-100",
  fail: "border-l-red-600 bg-red-50 text-red-950 dark:border-l-red-400 dark:bg-red-950/50 dark:text-red-100",
  unverifiable: "border-l-amber-500 bg-amber-50 text-amber-950 dark:border-l-amber-300 dark:bg-amber-950/40 dark:text-amber-100",
};

export const TAG_CLASS: Record<VerdictStatus, string> = {
  pass: "bg-emerald-700 text-white dark:bg-emerald-300 dark:text-emerald-950",
  fail: "bg-red-700 text-white dark:bg-red-300 dark:text-red-950",
  unverifiable: "bg-amber-600 text-black dark:bg-amber-300 dark:text-amber-950",
};

export const ROW_STATUS_CLASS: Record<RowStatus, string> = {
  verified: "text-emerald-800 dark:text-emerald-300",
  "partly verified": "text-amber-800 dark:text-amber-300",
  "needs review": "text-red-700 dark:text-red-300",
};
