import { useEffect, useId, useState } from "react";
import { MARKET_RANGES, type MarketAsset, type MarketPoint, type MarketPrices, type MarketRange } from "../../lib/market-prices";
import { Button } from "./ui";

const cache = new Map<string, MarketPrices>();
const money = (value:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
export function AssetPriceChart({ asset }: { asset: MarketAsset }) {
 const [range,setRange] = useState<MarketRange>("1M");
 const key = `${asset}:${range}`;
 const [result,setResult] = useState<{key:string;data:MarketPrices}|null>(null);
 const [error,setError] = useState(""); const [retry,setRetry] = useState(0);
 const [hover,setHover] = useState<number|null>(null);
 const gradient = useId().replace(/:/g,"");
 useEffect(()=>{
  const abort = new AbortController(); let active = true;
  setHover(null); setError("");
  const existing = cache.get(key);
  if(existing)setResult({key,data:existing});
  async function read(r:MarketRange) {
   const cached=cache.get(`${asset}:${r}`);
   if(cached && Date.now()-Date.parse(cached.fetchedAt)<60_000)return cached;
   const response=await fetch(`/api/market-prices?asset=${asset}&range=${r}`,{signal:abort.signal});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error ?? "Price history is unavailable.");
   cache.set(`${asset}:${r}`,data); return data as MarketPrices;
  }
  async function load() {
   if(document.visibilityState!=="visible")return;
   try {
    const [series,day]=await Promise.all([read(range),read("1D")]);
    const latest=day.points.at(-1)!;
    const data={...series,points:latest.timestamp>series.points.at(-1)!.timestamp?[...series.points,latest]:series.points};
    if(active){setResult({key,data});setError("");}
   } catch(e) { if(active&&!abort.signal.aborted)setError(e instanceof Error?e.message:"Could not load prices."); }
  }
  void load(); const timer=window.setInterval(()=>void load(),60_000);
  document.addEventListener("visibilitychange",load);
  return()=>{active=false;abort.abort();clearInterval(timer);document.removeEventListener("visibilitychange",load);};
 },[asset,key,range,retry]);
 const data=result?.key===key?result.data:null;
 const points=data?.points??[]; const latest=points.at(-1);
 const selected=hover===null?latest:points[Math.min(hover,points.length-1)];
 const first=points[0];const delta=selected&&first?selected.value-first.value:0;
 const positive=delta>=0;
 const low=points.length?Math.min(...points.map(p=>p.value)):0;
 const high=points.length?Math.max(...points.map(p=>p.value)):1;
 const spread=high-low||high*.01||1;
 const x=(point:MarketPoint)=>((point.timestamp-first!.timestamp)/(latest!.timestamp-first!.timestamp||1))*1000;
 const y=(point:MarketPoint)=>240-((point.value-low)/spread)*210;
 const line=points.map((point,i)=>`${i?'L':'M'}${x(point).toFixed(2)},${y(point).toFixed(2)}`).join(' ');
 const date=(timestamp:number)=>new Date(timestamp*1000).toLocaleString(undefined,range==='1D'?{hour:'numeric',minute:'2-digit'}:{month:'short',day:'numeric',...(range==='1Y'?{year:'numeric'}:{})});
 const name=asset==='btc'?'Bitcoin':'Tether Gold';
 return <section className="nb-asset-market" aria-label={`${name} market price`}>
  <div className="nb-asset-market__heading"><div><div className="nb-asset-eyebrow">Market price · USD</div><div className="nb-asset-price">{selected?money(selected.value):"—"}</div><div className={`nb-asset-change ${positive?'is-positive':'is-negative'}`}>{selected&&first?<><span>{positive?'↑':'↓'} {money(Math.abs(delta))} ({Math.abs(delta/first.value*100).toFixed(2)}%)</span><span className="nb-asset-muted">{hover===null?MARKET_RANGES[range].label:date(selected.timestamp)}</span></>:<span className="nb-asset-muted">{error?"Price unavailable":"Loading price history…"}</span>}</div></div></div>
  <div className="nb-asset-plot" aria-busy={!data&&!error}>
   {points.length?<>
    <svg viewBox="0 0 1000 260" preserveAspectRatio="none" role="img" aria-label={`${name} price history for the ${MARKET_RANGES[range].label}`}>
     <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".16"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
     <path d={`${line} L1000,260 L0,260 Z`} fill={`url(#${gradient})`}/>
     <line x1="0" x2="1000" y1={y(first!)} y2={y(first!)} stroke="#363636" strokeDasharray="2 5" vectorEffect="non-scaling-stroke"/>
     <path d={line} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
     {hover!==null&&selected?<line x1={x(selected)} x2={x(selected)} y1="0" y2="260" stroke="#666666" vectorEffect="non-scaling-stroke"/>:null}
    </svg>
    {selected?<span className="nb-asset-chart-dot" style={{left:`${x(selected)/10}%`,top:`${y(selected)/2.6}%`}}/>:null}
    <input className="nb-asset-chart-scrubber" type="range" min={0} max={points.length-1} value={hover??points.length-1} aria-label={`Explore ${name} price history`} aria-valuetext={selected?`${money(selected.value)}, ${date(selected.timestamp)}`:undefined} onChange={e=>setHover(Number(e.target.value))} onPointerMove={e=>{if(e.pointerType==='touch'&&e.buttons===0)return;const rect=e.currentTarget.getBoundingClientRect();const timestamp=first!.timestamp+Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*(latest!.timestamp-first!.timestamp);let closest=0;points.forEach((p,i)=>{if(Math.abs(p.timestamp-timestamp)<Math.abs(points[closest].timestamp-timestamp))closest=i});setHover(closest);}} onPointerLeave={()=>setHover(null)} onBlur={()=>setHover(null)} />
   </>:<div className="nb-asset-chart-empty" role="status">{error?<><p>{error}</p><Button onClick={()=>setRetry(n=>n+1)}>Try again</Button></>:<div className="nb-asset-chart-loading"/>}</div>}
  </div>
  <div className="nb-asset-axis" aria-hidden>{points.length?[points[0],points[Math.floor(points.length/2)],latest!].map((p,i)=><span key={i}>{date(p.timestamp)}</span>):<span> </span>}</div>
  <div className="nb-asset-chart-footer"><div className="nb-asset-ranges" aria-label="Price history range">{(Object.keys(MARKET_RANGES) as MarketRange[]).map(r=><button key={r} type="button" aria-pressed={r===range} onClick={()=>{setRange(r);setHover(null);}}>{r}</button>)}</div></div>
  {error&&data?<p className="nb-asset-feed-error" role="status">Couldn’t refresh prices. Showing the last update. <button onClick={()=>setRetry(n=>n+1)}>Retry</button></p>:null}
 </section>;
}
