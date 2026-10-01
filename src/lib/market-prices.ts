export const MARKET_RANGES = {
 "1D": { days: 1, interval: "five_minutes", label: "past day" },
 "1W": { days: 7, interval: "thirty_minutes", label: "past week" },
 "1M": { days: 30, interval: "hour", label: "past month" },
 "1Y": { days: 365, interval: "day", label: "past year" },
} as const;
export type MarketRange = keyof typeof MARKET_RANGES;
export type MarketAsset = "btc" | "xaut";
export type MarketPoint = { timestamp: number; value: number };
export type MarketPrices = { asset: MarketAsset; range: MarketRange; points: MarketPoint[]; fetchedAt: string };
export function marketAsset(holding: string): MarketAsset | null {
 const symbol = holding.toLowerCase();
 return symbol === "btc" || symbol === "cbbtc" ? "btc" : symbol === "xaut" ? "xaut" : null;
}
export function cleanMarketPoints(input: unknown): MarketPoint[] {
 if (!Array.isArray(input) || input.length > 2000) throw new Error("Invalid price history");
 const points = new Map<number, number>();
 for (const point of input) {
  if (point?.value === null) continue;
  if (!point || typeof point.timestamp !== "number" || !Number.isFinite(point.timestamp) || point.timestamp <= 0 || typeof point.value !== "number" || !Number.isFinite(point.value) || point.value <= 0) throw new Error("Invalid price history");
  points.set(point.timestamp, point.value);
 }
 if (points.size < 2) throw new Error("Insufficient price history");
 return [...points].sort(([a],[b]) => a-b).map(([timestamp,value])=>({ timestamp,value }));
}
