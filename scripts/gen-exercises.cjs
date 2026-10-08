/**
 * Generates exercises.csv from exercicios_normalizados.xlsx (aba "Exercicios").
 *
 * Run automatically via `predev` and `prebuild` hooks — no manual steps needed.
 * To run manually: node scripts/gen-exercises.cjs
 *
 * The `origem` column exists in the XLSX for editorial control and is excluded
 * from the generated CSV to keep the runtime bundle lean.
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const XLSX_PATH = path.join(ROOT, "src", "domain", "entities", "exercicios_normalizados.xlsx");
const CSV_PATH = path.join(ROOT, "src", "domain", "entities", "exercises.csv");
const SHEET_NAME = "Exercicios";

const COLUMNS = [
  "id",
  "name",
  "muscleGroup",
  "muscleSubgroup",
  "category",
  "equipment",
  "type",
  "inputMode",
  "defaultSets",
  "defaultReps",
  "defaultWeight",
  "defaultDurationSeconds",
  "defaultSpeedKmh",
  "defaultDistanceMeters",
  "sports",
];

/** Escape a value for CSV: wrap in quotes if it contains commas, quotes, or newlines. */
function escapeCsv(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  const needsQuotes =
    s.indexOf(",") >= 0 ||
    s.indexOf('"') >= 0 ||
    s.indexOf("\n") >= 0 ||
    s.indexOf("|") >= 0;
  if (needsQuotes) return '"' + s.split('"').join('""') + '"';
  return s;
}

function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error("[gen-exercises] XLSX not found:", XLSX_PATH);
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH);

  if (!wb.SheetNames.includes(SHEET_NAME)) {
    console.error(
      '[gen-exercises] Sheet "' + SHEET_NAME + '" not found in XLSX. Available sheets:',
      wb.SheetNames.join(", ")
    );
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(wb.Sheets[SHEET_NAME]);

  if (rows.length === 0) {
    console.error("[gen-exercises] No rows found in sheet:", SHEET_NAME);
    process.exit(1);
  }

  const lines = rows.map(function (row) {
    return COLUMNS.map(function (col) {
      return escapeCsv(row[col]);
    }).join(",");
  });

  // UTF-8 BOM so Excel opens the file correctly without encoding issues
  const csv = "\uFEFF" + COLUMNS.join(",") + "\n" + lines.join("\n") + "\n";

  fs.writeFileSync(CSV_PATH, csv, "utf8");

  console.log(
    "[gen-exercises] Generated exercises.csv — " +
      lines.length +
      " exercises from " +
      XLSX_PATH
  );
}

main();
