import type { Verdict } from "../types";
import { isBlank, verdict } from "./verdict";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

export interface Interval {
  open: string;
  close: string;
  overnight: boolean;
}

export type WeeklySchedule = Partial<Record<Day, Interval[] | "closed">>;

export type HoursParse = { ok: true; schedule: WeeklySchedule } | { ok: false; error: string };

const DAY_ALIASES: Record<string, Day> = {
  mon: "Mon", monday: "Mon",
  tue: "Tue", tues: "Tue", tuesday: "Tue",
  wed: "Wed", wednesday: "Wed",
  thu: "Thu", thur: "Thu", thurs: "Thu", thursday: "Thu",
  fri: "Fri", friday: "Fri",
  sat: "Sat", saturday: "Sat",
  sun: "Sun", sunday: "Sun",
};

function dayOf(token: string): Day | null {
  return DAY_ALIASES[token.trim().toLowerCase().replace(/\.$/, "")] ?? null;
}

/** "Mon-Fri, Sun" -> [Mon..Fri, Sun]. Ranges may wrap past Sunday, e.g. Fri-Mon. */
function parseDays(text: string): Day[] | string {
  if (/^daily$/i.test(text.trim())) return [...DAYS];
  const out: Day[] = [];
  for (const part of text.split(",")) {
    const ends = part.split("-").map((s) => s.trim());
    if (ends.length > 2) return `day range "${part.trim()}" has too many hyphens`;
    const start = dayOf(ends[0]!);
    const end = ends.length === 2 ? dayOf(ends[1]!) : start;
    if (!start || !end) return `"${part.trim()}" is not a day or day range`;
    let i = DAYS.indexOf(start);
    for (;;) {
      out.push(DAYS[i]!);
      if (DAYS[i] === end) break;
      i = (i + 1) % 7;
    }
  }
  return out;
}

/** Returns minutes after midnight, or an error. Bare numbers such as "9" are ambiguous and rejected. */
function parseTime(token: string, isClose: boolean): number | string {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i.exec(token.trim());
  if (!m) return `"${token.trim()}" is not a time`;
  const hour = Number(m[1]);
  const minute = m[2] === undefined ? 0 : Number(m[2]);
  const meridiem = m[3]?.toLowerCase().replace(/\./g, "");
  if (minute > 59) return `"${token.trim()}" has minutes above 59`;
  if (meridiem) {
    if (hour < 1 || hour > 12) return `"${token.trim()}" is not a 12-hour time`;
    return ((hour % 12) + (meridiem === "pm" ? 12 : 0)) * 60 + minute;
  }
  if (m[2] === undefined) return `"${token.trim()}" is ambiguous without minutes or am/pm`;
  if (hour === 24 && minute === 0 && isClose) return 24 * 60;
  if (hour > 23) return `"${token.trim()}" has an hour above 23`;
  return hour * 60 + minute;
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  return `${String(h).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function parseIntervals(text: string): Interval[] | string {
  if (/^closed$/i.test(text.trim())) return [];
  const out: Interval[] = [];
  for (const part of text.split(/\s*(?:,|&|\band\b)\s*/i)) {
    const ends = part.split(/\s*(?:-|to)\s*/i);
    if (ends.length !== 2) return `"${part}" is not an open-close range`;
    const open = parseTime(ends[0]!, false);
    const close = parseTime(ends[1]!, true);
    if (typeof open === "string") return open;
    if (typeof close === "string") return close;
    if (open === close) return `"${part}" opens and closes at the same time`;
    out.push({ open: fmt(open), close: fmt(close), overnight: close < open });
  }
  return out;
}

const SEGMENT = /^\s*([a-z.]+(?:\s*[-,]\s*[a-z.]+)*)\s+(.+?)\s*$/i;

/** Parses "Mon-Fri 9:00-17:00; Sat 10am-2pm; Sun closed" into a weekly schedule. */
export function parseHours(raw: string): HoursParse {
  const schedule: WeeklySchedule = {};
  const segments = raw.split(";").filter((s) => s.trim() !== "");
  if (segments.length === 0) return { ok: false, error: "no hours given" };
  for (const segment of segments) {
    const m = SEGMENT.exec(segment);
    if (!m) return { ok: false, error: `"${segment.trim()}" does not start with days followed by hours` };
    const days = parseDays(m[1]!);
    if (typeof days === "string") return { ok: false, error: days };
    const intervals = parseIntervals(m[2]!);
    if (typeof intervals === "string") return { ok: false, error: intervals };
    for (const day of days) {
      if (schedule[day] !== undefined) return { ok: false, error: `${day} is listed more than once` };
      schedule[day] = intervals.length === 0 ? "closed" : intervals;
    }
  }
  return { ok: true, schedule };
}

export function describeSchedule(schedule: WeeklySchedule): string {
  return DAYS.map((d) => {
    const s = schedule[d];
    if (s === undefined) return `${d} not listed`;
    if (s === "closed") return `${d} closed`;
    return `${d} ${s.map((i) => `${i.open}-${i.close}${i.overnight ? " (overnight)" : ""}`).join(", ")}`;
  }).join("; ");
}

export function checkHours(raw: string): Verdict | null {
  if (isBlank(raw)) return null;
  const parsed = parseHours(raw);
  if (!parsed.ok) {
    return verdict("hours", "hours.parse", "fail", `Hours do not parse: ${parsed.error}.`, `"${raw.trim()}"`);
  }
  const listed = DAYS.filter((d) => parsed.schedule[d] !== undefined).length;
  return verdict("hours", "hours.parse", "pass", `Parsed into a weekly schedule covering ${listed} of 7 days.`, describeSchedule(parsed.schedule));
}
