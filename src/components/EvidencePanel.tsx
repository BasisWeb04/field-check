import { useEffect, useRef } from "react";
import { RULE_LABELS } from "../core/sources";
import type { FieldName, RowResult, VerdictStatus } from "../core/types";
import { StatusTag } from "./StatusTag";

const SEVERITY: Record<VerdictStatus, number> = { fail: 0, unverifiable: 1, pass: 2 };

interface Props {
  row: RowResult;
  field: FieldName;
  onClose: () => void;
}

export function EvidencePanel({ row, field, onClose }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Lead with the verdict that explains the cell color.
  const verdicts = row.verdicts
    .filter((v) => v.field === field)
    .sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status]);

  // Move focus so keyboard and screen reader users land on the evidence they asked for.
  useEffect(() => headingRef.current?.focus(), [row.rowNumber, field]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      aria-labelledby="evidence-heading"
      className="panel fixed inset-x-2 bottom-2 z-30 max-h-[60vh] overflow-y-auto p-4 shadow-lg lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:max-h-[calc(100vh-2rem)] lg:shadow-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Evidence for row <span className="font-mono">{row.record.id}</span>
          </p>
          <h2 id="evidence-heading" ref={headingRef} tabIndex={-1} className="font-mono text-base font-semibold">
            {field}
          </h2>
        </div>
        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="mt-2 rounded bg-stone-100 p-2 font-mono text-xs dark:bg-stone-800">
        <span className="text-stone-600 dark:text-stone-400">value: </span>
        {row.record[field].trim() === "" ? "(blank)" : row.record[field]}
      </div>

      <ol className="mt-3 space-y-3">
        {verdicts.map((v) => (
          <li key={v.ruleId} className="border-t border-stone-200 pt-3 first:border-t-0 first:pt-0 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <StatusTag status={v.status} />
              <span className="font-mono text-xs font-semibold">{v.ruleId}</span>
            </div>
            <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">{RULE_LABELS[v.ruleId]}</p>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div>
                <dt className="font-semibold">Message</dt>
                <dd>{v.message}</dd>
              </div>
              <div>
                <dt className="font-semibold">Evidence</dt>
                <dd className="break-words font-mono">{v.evidence}</dd>
              </div>
              <div>
                <dt className="font-semibold">Source</dt>
                <dd className="text-stone-700 dark:text-stone-300">{v.source}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </aside>
  );
}
