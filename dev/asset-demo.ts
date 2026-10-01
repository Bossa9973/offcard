import type { Plugin } from "vite";

// The official demo's fixed list ignores query arguments. Adapt only that demo
// fixture response, so asset pages exercise the real Element with filtered data.
// No SDK/package files are changed, and this plugin is never enabled in builds.
export function assetDemoPlugin(): Plugin {
 return { name:"neobank-asset-demo", apply:"serve", configureServer(server) {
  server.middlewares.use(async(req,res,next)=>{
   const pathname=(req.url??"").split("?")[0];
   if(!/^\/__elements\/elements\/[a-z]+\/wallet\/activity\/[a-z-]+\/demo\/entry-[A-Z0-9]+\.js$/.test(pathname))return next();
   try {
    const upstream=await fetch(`http://127.0.0.1:8788${pathname.replace(/^\/__elements/,"")}`,{signal:AbortSignal.timeout(5000)});
    if(!upstream.ok)return next();
    const source=await upstream.text();
    if(!source.includes("demoSdk: buildDemoSdk("))return next();
    const adapter=`\nfunction neobankAssetDemoSdk(fixtures) {
 const sdk = buildDemoSdk(fixtures);
 return new Proxy(sdk, { get(target, key) {
  if (key !== 'financialActivity') return target[key];
  return { async list(params) {
   const page = await target.financialActivity.list(params);
   if (!params?.currency) return page;
   const normalize = value => String(value ?? '').toLowerCase().replace(/^cbbtc$/, 'btc');
   const currency = normalize(params.currency);
   return { ...page, data: page.data.filter(row => normalize(row.currency?.code) === currency || (row.source?.object === 'onchain_swap' && [row.source.from_currency, row.source.to_currency].some(value => normalize(value) === currency))) };
  }};
 }});
}\n`;
    res.writeHead(200,{"Content-Type":"text/javascript","Cache-Control":"no-store"});
    res.end(source.replace("demoSdk: buildDemoSdk(","demoSdk: neobankAssetDemoSdk(")+adapter);
   }catch{next();}
  });
 }};
}
