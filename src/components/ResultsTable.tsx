import { cellStatus } from "../core/engine";
import { FIELDS, type FieldName, type RowResult } from "../core/types";
import { CELL_CLASS, ROW_STATUS_CLASS, STATUS_WORD } from "./status";
import { StatusTag } from "./StatusTag";

export interface CellRef {
  rowNumber: number;
  field: FieldName;
}

interface Props {
  rows: RowResult[];
  selected: CellRef | null;
  onSelect: (cell: CellRef) => void;
}

function Cell({ row, field, selected, onSelect }: { row: RowResult; field: FieldName } & Omit<Props, "rows">) {
  const verdicts = row.verdicts.filter((v) => v.field === field);
  const status = cellStatus(verdicts);
  const value = row.record[field].trim();
  const isSelected = selected?.rowNumber === row.rowNumber && selected.field === field;
  if (!status) return <td className="px-1 py-1" />;
  return (
    <td className="p-0.5">
      <button
        type="button"
        onClick={() => onSelect({ rowNumber: row.rowNumber, field })}
        aria-label={`${row.record.id} ${field}: ${STATUS_WORD[status]}. Value ${value || "blank"}. Show evidence.`}
        aria-pressed={isSelected}
        className={`flex w-full min-w-[8rem] max-w-[16rem] items-start gap-1.5 border-l-4 px-1.5 py-1 text-left ${CELL_CLASS[status]} ${
          isSelected ? "ring-2 ring-teal-700 dark:ring-teal-300" : ""
        }`}
      >
        <StatusTag status={status} />
        <span className="truncate" title={value}>
          {value || <em className="not-italic opacity-70">(blank)</em>}
        </span>
      </button>
    </td>
  );
}

export function ResultsTable({ rows, selected, onSelect }: Props) {
  return (
    <div className="panel max-h-[70vh] overflow-auto">
      <table className="w-full border-collapse text-xs">
        <caption className="sr-only">One row per record, one cell per field, each marked PASS, FAIL or UNV</caption>
        <thead className="sticky top-0 z-10 bg-stone-200 text-left dark:bg-stone-800">
          <tr>
            <th scope="col" className="sticky left-0 z-20 bg-stone-200 px-2 py-2 font-semibold dark:bg-stone-800">
              id
            </th>
            <th scope="col" className="px-2 py-2 font-semibold">
              row status
            </th>
            {FIELDS.map((f) => (
              <th key={f} scope="col" className="whitespace-nowrap px-2 py-2 font-mono font-semibold">
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowNumber} className="border-t border-stone-200 dark:border-stone-700">
              <th
                scope="row"
                className="sticky left-0 whitespace-nowrap bg-white px-2 py-1 text-left font-mono font-normal dark:bg-stone-900"
              >
                {row.record.id}
              </th>
              <td className={`whitespace-nowrap px-2 py-1 font-semibold ${ROW_STATUS_CLASS[row.status]}`}>{row.status}</td>
              {FIELDS.map((f) => (
                <Cell key={f} row={row} field={f} selected={selected} onSelect={onSelect} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
