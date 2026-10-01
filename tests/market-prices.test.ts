import test from "node:test";
import assert from "node:assert/strict";
import { cleanMarketPoints, marketAsset } from "../src/lib/market-prices";
import { getMarketPrices } from "../src/lib/market-prices.server";

test("market history normalizes ordered points and rejects invalid prices",()=>{
 assert.equal(marketAsset("cbBTC"),"btc");assert.equal(marketAsset("XAUT"),"xaut");assert.equal(marketAsset("usd"),null);
 assert.deepEqual(cleanMarketPoints([{timestamp:2,value:20},{timestamp:1,value:10},{timestamp:2,value:21},{timestamp:3,value:null}]),[{timestamp:1,value:10},{timestamp:2,value:21}]);
 for(const bad of [[],[{timestamp:1,value:NaN}],[{timestamp:1,value:-1}],[{timestamp:1,value:0}],[{timestamp:"1",value:10}]])assert.throws(()=>cleanMarketPoints(bad));
});
test("public feed allowlists assets and ranges before any upstream request",async()=>{
 for(const query of ['asset=usd&range=1D','asset=btc&range=ALL','asset=btc&range=constructor','asset=btc&range=__proto__','asset=https://example.com&range=1D'])assert.equal((await getMarketPrices(new Request('https://bank.example/api/market-prices?'+query))).status,400);
 assert.equal((await getMarketPrices(new Request('https://bank.example/api/market-prices?asset=btc&range=1D',{method:'POST'}))).status,405);
});
test("public feed strips credentials and coalesces/cache identical market requests",async()=>{
 const original=globalThis.fetch;const calls:{url:URL;headers:Headers}[]=[];
 globalThis.fetch=async(url,init)=>{calls.push({url:new URL(String(url)),headers:new Headers(init?.headers)});return Response.json({data:{points:[{timestamp:1,value:100},{timestamp:2,value:101}]}});};
 try {
  const request=()=>new Request('https://bank.example/api/market-prices?asset=btc&range=1W&account_id=biz_private',{headers:{Cookie:'private-cookie',Authorization:'Bearer private-token'}});
  const responses=await Promise.all([getMarketPrices(request()),getMarketPrices(request())]);assert(responses.every(r=>r.status===200));await getMarketPrices(request());assert.equal(calls.length,1);
  assert.equal(calls[0].url.origin,'https://api.whop.com');assert.equal(calls[0].url.searchParams.get('interval'),'thirty_minutes');assert.equal(calls[0].url.searchParams.has('account_id'),false);
  assert.equal(calls[0].headers.get('Authorization'),null);assert.equal(calls[0].headers.get('Cookie'),null);assert.equal(calls[0].headers.get('x-whop-inject-key'),'none');
  assert.equal(responses[0].headers.get('Cache-Control'),'public, max-age=60, s-maxage=60');
  globalThis.fetch=async()=>Response.json({data:{points:[]}});assert.equal((await getMarketPrices(new Request('https://bank.example/api/market-prices?asset=xaut&range=1Y'))).status,502);
 }finally{globalThis.fetch=original;}
});
