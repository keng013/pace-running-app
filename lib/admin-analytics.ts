import "server-only";

const PROJECT_ID = process.env.VERCEL_ANALYTICS_PROJECT_ID || "prj_LdjJCNlbL7pfz0m4Q66xDJl4VOJD";
const TEAM_ID = process.env.VERCEL_ANALYTICS_TEAM_ID || "team_t9VqWpq6dTarUtCPUbtzBJfq";

export type MetricRow = { name: string; views: number; visitors: number };
export type TrendRow = { date: string; views: number; visitors: number };
export type AnalyticsSnapshot = {
  available: boolean; reason: string; views: number | null; visitors: number | null;
  trend: TrendRow[]; pages: MetricRow[]; sources: MetricRow[]; countries: MetricRow[];
  devices: MetricRow[]; browsers: MetricRow[]; fetchedAt: string | null;
};

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => v && typeof v === "object" && !Array.isArray(v) ? v as Json : {};
const num = (v: unknown): number | null => typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
const metric = (row: Json, keys: string[]): number | null => {
  for (const key of keys) { const n = num(row[key]); if (n !== null) return n; }
  return null;
};
const rowsOf = (value: unknown): Json[] => {
  if (Array.isArray(value)) return value.map(obj);
  const r = obj(value);
  for (const key of ["data", "results", "rows", "items"]) if (Array.isArray(r[key])) return (r[key] as unknown[]).map(obj);
  return [];
};
const countViews = (row: Json) => metric(row, ["pageviews", "pageViews", "views", "count", "total"]);
const countVisitors = (row: Json) => metric(row, ["visitors", "uniqueVisitors", "unique", "users"]);
const labelOf = (row: Json, key: string) => {
  const dimension = obj(row.dimensions);
  const value = row[key] ?? dimension[key] ?? row.name ?? row.label;
  return typeof value === "string" && value.trim() ? value : "Unknown";
};

async function query(path: string, params: Record<string, string>): Promise<unknown> {
  const token = process.env.VERCEL_ANALYTICS_API_TOKEN;
  if (!token) throw new Error("MISSING_TOKEN");
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/" + path);
  url.searchParams.set("projectId", PROJECT_ID);
  url.searchParams.set("teamId", TEAM_ID);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("ANALYTICS_HTTP_" + response.status);
  return response.json();
}

function dimensionRows(value: unknown, key: string): MetricRow[] {
  return rowsOf(value).map(row => ({
    name: labelOf(row, key), views: countViews(row) ?? 0, visitors: countVisitors(row) ?? 0,
  })).filter(row => row.views > 0 || row.visitors > 0).sort((a, b) => b.views - a.views).slice(0, 10);
}
export async function getAnalytics(days: number): Promise<AnalyticsSnapshot> {
  const empty: AnalyticsSnapshot = { available: false, reason: "", views: null, visitors: null, trend: [], pages: [], sources: [], countries: [], devices: [], browsers: [], fetchedAt: null };
  if (!process.env.VERCEL_ANALYTICS_API_TOKEN) return { ...empty, reason: "ยังไม่ได้ตั้งค่า VERCEL_ANALYTICS_API_TOKEN สำหรับดึงข้อมูลจริง" };
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const until = new Date().toISOString();
  const range = { since, until };
  const specs = [
    ["count", {}],
    ["aggregate", { by: "day", ...range }],
    ["aggregate", { by: "requestPath", ...range, limit: "10" }],
    ["aggregate", { by: "referrerHostname", ...range, limit: "10" }],
    ["aggregate", { by: "country", ...range, limit: "10" }],
    ["aggregate", { by: "deviceType", ...range, limit: "10" }],
    ["aggregate", { by: "browserName", ...range, limit: "10" }],
  ] as const;
  const results = await Promise.allSettled(specs.map(([path, params]) => query(path, { ...range, ...params })));
  const ok = (index: number) => results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<unknown>).value : null;
  const count = obj(ok(0));
  const views = countViews(count) ?? countViews(obj(count.data)) ?? countViews(obj(count.result));
  const visitors = countVisitors(count) ?? countVisitors(obj(count.data)) ?? countVisitors(obj(count.result));
  const trend = rowsOf(ok(1)).map(row => ({
    date: labelOf(row, "day"), views: countViews(row) ?? 0, visitors: countVisitors(row) ?? 0,
  })).filter(row => row.date !== "Unknown").sort((a,b) => a.date.localeCompare(b.date));
  const pages = dimensionRows(ok(2), "requestPath");
  const sources = dimensionRows(ok(3), "referrerHostname");
  const countries = dimensionRows(ok(4), "country");
  const devices = dimensionRows(ok(5), "deviceType");
  const browsers = dimensionRows(ok(6), "browserName");
  const available = views !== null || visitors !== null || trend.length > 0 || pages.length > 0;
  const firstError = results.find(result => result.status === "rejected") as PromiseRejectedResult | undefined;
  const reason = available ? (firstError ? "บางหมวดข้อมูลยังไม่พร้อมใช้งาน" : "") : firstError ? String(firstError.reason?.message || "ANALYTICS_UNAVAILABLE").replace(/Bearer\s+\S+/gi, "[redacted]") : "API ยังไม่ส่งข้อมูลในช่วงเวลาที่เลือก";
  return { available, reason, views, visitors, trend, pages, sources, countries, devices, browsers, fetchedAt: available ? new Date().toISOString() : null };
}
