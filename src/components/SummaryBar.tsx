import { RULE_LABELS } from "../core/sources";
import { RULE_IDS, type RuleId, type Summary } from "../core/types";

interface Props {
  summary: Summary;
  activeRule: RuleId | "all";
  onPickRule: (rule: RuleId | "all") => void;
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="min-w-[6.5rem] flex-1 border-l border-stone-200 px-3 first:border-l-0 dark:border-stone-700">
      <dt className="text-xs text-stone-600 dark:text-stone-400">{label}</dt>
      <dd className={`font-mono text-2xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</dd>
    </div>
  );
}

export function SummaryBar({ summary: s, activeRule, onPickRule }: Props) {
  return (
    <section aria-labelledby="summary-heading" className="panel p-4">
      <h2 id="summary-heading" className="sr-only">
        Summary
      </h2>
      <dl className="flex flex-wrap gap-y-3">
        <Stat label="Rows" value={s.rows} />
        <Stat label="Verified" value={s.verified} tone="text-emerald-800 dark:text-emerald-300" />
        <Stat label="Partly verified" value={s.partlyVerified} tone="text-amber-800 dark:text-amber-300" />
        <Stat label="Needs review" value={s.needsReview} tone="text-red-700 dark:text-red-300" />
      </dl>
      <p className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
        Field verdicts: <span className="font-mono">{s.verdicts.pass}</span> pass,{" "}
        <span className="font-mono">{s.verdicts.unverifiable}</span> unverifiable,{" "}
        <span className="font-mono">{s.verdicts.fail}</span> fail
      </p>
      <div className="mt-3">
        <h3 className="field-label">Fails by rule (select to filter)</h3>
        <ul className="flex flex-wrap gap-1.5">
          {RULE_IDS.map((id) => {
            const n = s.failsByRule[id];
            const active = activeRule === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onPickRule(active ? "all" : id)}
                  className={`rounded border px-2 py-1 text-xs ${
                    active
                      ? "border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-300 dark:bg-teal-950 dark:text-teal-100"
                      : "border-stone-300 hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800"
                  }`}
                >
                  <span className="font-mono">{id}</span>{" "}
                  <span className={`font-mono font-semibold ${n > 0 ? "text-red-700 dark:text-red-300" : "text-stone-500 dark:text-stone-400"}`}>
                    {n}
                  </span>
                  <span className="sr-only"> fails, {RULE_LABELS[id]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
