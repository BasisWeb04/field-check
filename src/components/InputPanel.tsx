import { useId, useState, type DragEvent } from "react";
import { INPUT_COLUMNS } from "../core/types";

// Keeps parsing responsive in the tab; the demo targets directory exports, not bulk dumps.
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  onRun: (csvText: string, label: string) => void;
  onLoadSample: () => void;
  onError: (message: string) => void;
}

export function InputPanel({ onRun, onLoadSample, onError }: Props) {
  const [pasted, setPasted] = useState("");
  const [dragging, setDragging] = useState(false);
  const textareaId = useId();
  const fileId = useId();

  async function readFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onError(`${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB; this demo accepts up to 5 MB.`);
      return;
    }
    onRun(await file.text(), file.name);
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setDragging(false);
    void readFile(e.dataTransfer.files[0]);
  }

  return (
    <section
      aria-labelledby="input-heading"
      className={`panel p-4 ${dragging ? "outline outline-2 outline-dashed outline-teal-700 dark:outline-teal-300" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="input-heading" className="text-base font-semibold">
          Input
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          Checks run in this browser tab. Nothing is uploaded.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={onLoadSample}>
          Load sample (60 rows)
        </button>
        <label htmlFor={fileId} className="btn-secondary cursor-pointer">
          Choose CSV file
        </label>
        <input
          id={fileId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            void readFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <span className="text-xs text-stone-600 dark:text-stone-400">or drop a .csv file on this panel</span>
      </div>

      <div className="mt-4">
        <label htmlFor={textareaId} className="field-label">
          Paste CSV
        </label>
        <textarea
          id={textareaId}
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={INPUT_COLUMNS.join(",")}
          className="w-full rounded border border-stone-300 bg-stone-50 p-2 font-mono text-xs placeholder:text-stone-500 dark:border-stone-600 dark:bg-stone-950 dark:placeholder:text-stone-500"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Header must include: <code className="font-mono">{INPUT_COLUMNS.join(", ")}</code>
          </p>
          <button
            type="button"
            className="btn-secondary"
            disabled={pasted.trim() === ""}
            onClick={() => onRun(pasted, "pasted CSV")}
          >
            Check pasted CSV
          </button>
        </div>
      </div>
    </section>
  );
}
