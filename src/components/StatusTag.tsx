import type { VerdictStatus } from "../core/types";
import { STATUS_TAG, STATUS_WORD, TAG_CLASS } from "./status";

export function StatusTag({ status }: { status: VerdictStatus }) {
  return (
    <span
      className={`inline-block min-w-[2.75rem] rounded-sm px-1 py-px text-center font-mono text-[10px] font-bold leading-4 ${TAG_CLASS[status]}`}
      title={STATUS_WORD[status]}
    >
      {STATUS_TAG[status]}
    </span>
  );
}
