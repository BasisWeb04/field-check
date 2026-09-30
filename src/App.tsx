import { useCallback, useId, useMemo, useState } from "react";
import sampleCsv from "../data/sample.csv?raw";
import { verifyCsv } from "./core/engine";
import { toResultsJson } from "./core/export";
import { RULE_LABELS, RULE_SOURCES } from "./core/sources";
import { RULE_IDS, type RowStatus, type RuleId, type RunResult } from "./core/types";
import { EvidencePanel } from "./components/EvidencePanel";
import { InputPanel } from "./components/InputPanel";
import { ResultsTable, type CellRef } from "./components/ResultsTable";
import { SummaryBar } from "./components/SummaryBar";

const SAMPLE_LABEL = "data/sample.csv";
const ROW_STATUSES: RowStatus[] = ["verified", "partly verified", "needs review"];

function downloadJson(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  // Start on the bundled sample so the first paint shows results instead of an empty state.
  const [result, setResult] = useState<RunResult | null>(() => verifyCsv(sampleCsv));
  const [sourceLabel, setSourceLabel] = useState(SAMPLE_LABEL);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RowStatus | "all">("all");
  const [ruleFilter, setRuleFilter] = useState<RuleId | "all">("all");
  const [selected, setSelected] = useState<CellRef | null>(null);
  const statusId = useId();
  const ruleId = useId();

  const run = useCallback((text: string, label: string) => {
    try {
      setResult(verifyCsv(text));
      setSourceLabel(label);
      setError(null);
      setSelected(null);
      setStatusFilter("all");
      setRuleFilter("all");
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const visible = useMemo(() => {
    if (!result) return [];
    return result.rows.filter(
      (r) =>
        (statusFilter === "all" || r.status === statusFilter) &&
        (ruleFilter === "all" || r.verdicts.some((v) => v.ruleId === ruleFilter && v.status === "fail")),
    );
  }, [result, statusFilter, ruleFilter]);

  const selectedRow = selected && result ? result.rows.find((r) => r.rowNumber === selected.rowNumber) : undefined;
  const closePanel = useCallback(() => setSelected(null), []);

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-300 pb-3 dark:border-stone-700">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Field Check <span className="font-normal text-stone-600 dark:text-stone-400">row-level data verification</span>
          </h1>
          <p className="mt-1 max-w-2xl text-stone-700 dark:text-stone-300">
            Every field of every business record gets <strong>pass</strong>, <strong>fail</strong> or{" "}
            <strong>unverifiable</strong>, with the rule, the evidence and the source it relied on. Unverifiable means the
            data cannot prove it either way; nothing is guessed into a pass.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 text-xs sm:items-end">
          <span className="rounded border border-amber-600 px-2 py-0.5 font-semibold text-amber-900 dark:border-amber-300 dark:text-amber-200">
            Demo with fictional data
          </span>
          <a className="text-teal-800 underline dark:text-teal-300" href="https://ethanchacko.com">
            Built by Ethan Chacko
          </a>
        </div>
      </header>

      <main className="mt-4 space-y-4">
        <InputPanel onRun={run} onLoadSample={() => run(sampleCsv, SAMPLE_LABEL)} onError={setError} />

        {error && (
          <div role="alert" className="panel border-red-600 p-3 text-red-800 dark:border-red-400 dark:text-red-200">
            <strong>Could not check that input.</strong> {error}
          </div>
        )}

        {!result && !error && (
          <div className="panel border-dashed p-6 text-center text-stone-600 dark:text-stone-400">
            No results yet. Load the sample, choose a file or paste CSV text to run the checks.
          </div>
        )}

        {result && (
          <>
            <SummaryBar summary={result.summary} activeRule={ruleFilter} onPickRule={setRuleFilter} />

            <section aria-labelledby="results-heading" className="space-y-2">
              <div className="flex flex-wrap items-end gap-3">
                <h2 id="results-heading" className="mr-auto text-base font-semibold">
                  Results <span className="font-normal text-stone-600 dark:text-stone-400">from {sourceLabel}</span>
                </h2>
                <div className="w-44">
                  <label htmlFor={statusId} className="field-label">
                    Row status
                  </label>
                  <select
                    id={statusId}
                    className="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RowStatus | "all")}
                  >
                    <option value="all">All rows</option>
                    {ROW_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-52">
                  <label htmlFor={ruleId} className="field-label">
                    Rule failed
                  </label>
                  <select
                    id={ruleId}
                    className="select"
                    value={ruleFilter}
                    onChange={(e) => setRuleFilter(e.target.value as RuleId | "all")}
                  >
                    <option value="all">Any or none</option>
                    {RULE_IDS.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadJson(toResultsJson(result), "field-check-results.json")}
                >
                  Export JSON
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400" aria-live="polite">
                Showing {visible.length} of {result.rows.length} rows. Select a cell to see its evidence.
              </p>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                {visible.length > 0 ? (
                  <ResultsTable rows={visible} selected={selected} onSelect={setSelected} />
                ) : (
                  <div className="panel p-6 text-center text-stone-600 dark:text-stone-400">
                    No rows match these filters.{" "}
                    <button
                      type="button"
                      className="text-teal-800 underline dark:text-teal-300"
                      onClick={() => {
                        setStatusFilter("all");
                        setRuleFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                {selectedRow && selected ? (
                  <EvidencePanel row={selectedRow} field={selected.field} onClose={closePanel} />
                ) : (
                  <div className="panel hidden p-4 text-xs text-stone-600 dark:text-stone-400 lg:block">
                    Select any cell to see each rule that judged it, the evidence it found and the source of truth it used.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <details className="panel p-4">
          <summary className="cursor-pointer font-semibold">Rules and their sources</summary>
          <table className="mt-3 w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <th scope="col" className="py-1 pr-3">Rule id</th>
                <th scope="col" className="py-1 pr-3">Checks</th>
                <th scope="col" className="py-1">Source</th>
              </tr>
            </thead>
            <tbody>
              {RULE_IDS.map((id) => (
                <tr key={id} className="border-b border-stone-100 align-top dark:border-stone-800">
                  <td className="py-1.5 pr-3 font-mono">{id}</td>
                  <td className="py-1.5 pr-3">{RULE_LABELS[id]}</td>
                  <td className="py-1.5 text-stone-700 dark:text-stone-300">{RULE_SOURCES[id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </main>

      <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t border-stone-300 pt-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
        <span>Demo with fictional data. All processing happens in your browser; no data leaves this page.</span>
        <a className="text-teal-800 underline dark:text-teal-300" href="https://ethanchacko.com">
          Built by Ethan Chacko
        </a>
      </footer>
    </div>
  );
}
