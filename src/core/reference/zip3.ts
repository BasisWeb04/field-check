import table from "../../../data/zip3-state.json";

export interface Zip3Range {
  from: string;
  to: string;
  states: string[];
}

export const ZIP3_SOURCE: string = table.source;
export const ZIP3_RANGES: readonly Zip3Range[] = table.ranges;

/** States assigned to a 3-digit prefix, or null when the prefix is outside every range in the table. */
export function statesForPrefix(prefix: string): string[] | null {
  const n = Number(prefix);
  const hit = ZIP3_RANGES.find((r) => n >= Number(r.from) && n <= Number(r.to));
  return hit ? hit.states : null;
}
