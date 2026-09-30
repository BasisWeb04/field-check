import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { formatSummary, toResultsCsv, toResultsJson, verifyCsv } from "../src/core/index";

const USAGE = "Usage: npm run check -- <input.csv> [--out <dir>]";

function parseArgs(argv: string[]): { input: string; out: string } {
  let input = "";
  let out = "out";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--out") out = argv[++i] ?? "";
    else if (arg.startsWith("--out=")) out = arg.slice("--out=".length);
    else if (!input) input = arg;
    else throw new Error(`Unexpected argument "${arg}".`);
  }
  if (!input || !out) throw new Error("Missing input file or output directory.");
  return { input, out };
}

function main(): number {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`${(err as Error).message}\n${USAGE}`);
    return 2;
  }
  let result;
  try {
    result = verifyCsv(readFileSync(resolve(args.input), "utf8"));
  } catch (err) {
    console.error(`Cannot check ${args.input}: ${(err as Error).message}`);
    return 1;
  }
  const outDir = resolve(args.out);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "results.json"), toResultsJson(result));
  writeFileSync(join(outDir, "results.csv"), toResultsCsv(result));
  console.log(formatSummary(result));
  console.log(`\nWrote ${join(args.out, "results.json")} and ${join(args.out, "results.csv")}`);
  return 0;
}

process.exitCode = main();
