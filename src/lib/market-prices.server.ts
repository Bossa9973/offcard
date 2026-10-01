import { cleanMarketPoints, MARKET_RANGES, type MarketAsset, type MarketPrices, type MarketRange } from "./market-prices";

// Public market data only. Never forward account IDs, session cookies, or tokens.
const cache = new Map<string, { expires: number; data: MarketPrices }>();
const pending = new Map<string, Promise<MarketPrices>>();
export async function getMarketPrices(request: Request): Promise<Response> {
 if (request.method !== "GET") return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "GET" } });
 const query = new URL(request.url).searchParams;
 const asset = query.get("asset"); const range = query.get("range");
 if ((asset !== "btc" && asset !== "xaut") || !range || !Object.hasOwn(MARKET_RANGES, range)) return Response.json({ error: "Choose Bitcoin or Gold and a valid time range." }, { status: 400 });
 const key = `${asset}:${range}`;
 try {
  const cached = cache.get(key);
  let data = cached && cached.expires > Date.now() ? cached.data : undefined;
  if (!data) {
   let work = pending.get(key);
   if (!work) {
    work = retrieve(asset, range as MarketRange).then(data=>{cache.set(key,{data,expires:Date.now()+60_000});return data;}).finally(()=>pending.delete(key));
    pending.set(key,work);
   }
   data = await work;
  }
  return Response.json(data, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
 } catch { return Response.json({ error: "Price history is temporarily unavailable. Try again." }, { status: 502, headers: { "Cache-Control": "no-store" } }); }
}
async function retrieve(asset: MarketAsset, range: MarketRange): Promise<MarketPrices> {
 const spec = MARKET_RANGES[range];
 const to = Math.floor(Date.now()/60_000)*60_000;
 const url = new URL("https://api.whop.com/api/v1/stats/market_prices/");
 url.search = new URLSearchParams({ currency:asset, convert_to:"usd", interval:spec.interval, from:new Date(to-spec.days*86_400_000).toISOString(), to:new Date(to).toISOString() }).toString();
 const response = await fetch(url, { headers: { Accept:"application/json", "x-whop-inject-key":"none" }, signal:AbortSignal.timeout(10_000) });
 if (!response.ok) throw new Error("Price feed unavailable");
 const body = await response.json() as { data?: { points?: unknown } };
 return { asset, range, points:cleanMarketPoints(body.data?.points), fetchedAt:new Date().toISOString() };
}
