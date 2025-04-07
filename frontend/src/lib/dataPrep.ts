import {
    mean,
    mode,
    standardDeviation,
    min,
    max,
  } from "simple-statistics";
  
  export interface PrepReport {
    columnTypes: Record<string, "numeric" | "categorical">;
    removedRows: number;
    removedCols: string[];
    filledMissing: number;
    outliers: number;
  }
  
  const kebab = (s: string) =>
    s.trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase();
  
  export function prepareData(raw: any[]): { data: any[]; report: PrepReport } {
    if (!raw.length) return { data: [], report: {} as any };
  
    /* ---------- initial examination ---------- */
    const cols = Object.keys(raw[0]);
    const types: Record<string, "numeric" | "categorical"> = {};
    cols.forEach((c) => {
      const sample = raw.find((r) => r[c] !== "" && r[c] != null)?.[c];
      types[c] = !isNaN(Number(sample)) ? "numeric" : "categorical";
    });
  
    /* ---------- trim empty rows ---------- */
    let data = raw.filter((r) => cols.some((c) => r[c] !== "" && r[c] != null));
    const removedRows = raw.length - data.length;
  
    /* ---------- drop empty columns ---------- */
    const removedCols: string[] = [];
    cols.forEach((c) => {
      if (data.every((r) => r[c] === "" || r[c] == null)) removedCols.push(c);
    });
    data = data.map((r) => {
      removedCols.forEach((c) => delete r[c]);
      return r;
    });
  
    /* ---------- standardise column names ---------- */
    const map: Record<string, string> = {};
    Object.keys(data[0]).forEach((c) => (map[c] = kebab(c)));
    data = data.map((r) => {
      const n: any = {};
      Object.keys(r).forEach((c) => (n[map[c]] = r[c]));
      return n;
    });
  
    /* ---------- fill missing ---------- */
    let filledMissing = 0;
    const finalCols = Object.keys(data[0]);
    finalCols.forEach((c) => {
      const vals = data.map((r) => r[c]).filter((v) => v !== "" && v != null);
      const numeric = vals.every((v) => !isNaN(Number(v)));
      const fill = numeric ? mean(vals.map(Number)) : mode(vals);
      data.forEach((r) => {
        if (r[c] === "" || r[c] == null) {
          r[c] = fill;
          filledMissing++;
        }
        // convert numeric strings
        if (numeric) r[c] = Number(r[c]);
        // simple date parse
        if (!numeric && /^\d{4}-\d{2}-\d{2}/.test(r[c]))
          r[c] = new Date(r[c]).toISOString();
        if (typeof r[c] === "string") r[c] = r[c].trim();
      });
    });
  
    /* ---------- outliers ---------- */
    let outliers = 0;
    finalCols.forEach((c) => {
      const nums = data.map((r) => Number(r[c]));
      if (nums.some((v) => isNaN(v))) return;
      const μ = mean(nums);
      const σ = standardDeviation(nums);
      data.forEach((r) => {
        const z = σ ? (Number(r[c]) - μ) / σ : 0;
        if (Math.abs(z) > 3) {
          r[`__outlier_${c}`] = true;
          outliers++;
        }
      });
    });
  
    return {
      data,
      report: { columnTypes: types, removedRows, removedCols, filledMissing, outliers },
    };
  }