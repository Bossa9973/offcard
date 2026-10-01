import { useWhop, type LedgerActivity } from "@whop/elements-react";
import { useEffect, useRef, useState } from "react";
import { type MarketAsset } from "../../lib/market-prices";
import { AssetPriceChart } from "./asset-price-chart";
import { WalletElement } from "./wallet-element";
import { useWallet, useWalletAppearance } from "./wallet-provider";
import { ScreenLifecycle } from "./screen-lifecycle";
import { Button } from "./ui";
import { assetSummaryClasses, assetQuantityClasses } from "../theme";

type Mounted = { mount(target:HTMLElement):void; destroy():void; refresh():Promise<void> };
type Balances = { create(name:"breakdown",options:Record<string,unknown>):Mounted; destroy():void };
type AssetWallet = { create(name:"balances",options:Record<string,unknown>):Balances; createOverlay(name:"activityDetail",options:{activity:LedgerActivity}):{open():void} };
export function AssetScreen({ accountId, asset, holding, accessToken, onBack, onChanged }: {
 accountId:string; asset:MarketAsset; holding:string; accessToken?:string; onBack:()=>void; onChanged?:()=>void;
}) {
 const whop=useWhop();
 const wallet=useWallet() as unknown as AssetWallet|null;
 const appearance=useWalletAppearance();
 const target=useRef<HTMLDivElement>(null);const quantityTarget=useRef<HTMLDivElement>(null);const breakdown=useRef<Mounted[]>([]);
 const [revision,setRevision]=useState(0);
 const name=asset==='btc'?'Bitcoin':'Tether Gold';
 useEffect(()=>{
  if(!wallet||!whop||!target.current||!quantityTarget.current)return;
  const balances=wallet.create('balances',{accessToken,appearance});
  const options={currency:asset==='btc'?'cbBTC':'XAUT',padded:false};
  const element=balances.create('breakdown',{...options,showSourceCurrency:false,appearance:{...appearance,classes:{...appearance.classes,...assetSummaryClasses}}});
  // Breakdown is a singleton per wallet. A separate read-only wallet owns the
  // source-unit total; both displays still use official frames and formatting.
  const quantityWallet=whop.wallet.create({accountId,accessToken,currency:options.currency,appearance});
  const quantityBalances=(quantityWallet as unknown as AssetWallet).create('balances',{accessToken,appearance});
  const quantity=quantityBalances.create('breakdown',{...options,showSourceCurrency:true,appearance:{...appearance,classes:{...appearance.classes,...assetQuantityClasses}}});
  breakdown.current=[element,quantity];element.mount(target.current);quantity.mount(quantityTarget.current);
  return()=>{breakdown.current=[];element.destroy();quantity.destroy();balances.destroy();quantityBalances.destroy();quantityWallet.destroy();};
 },[wallet,whop,accountId,accessToken,holding]);
 function changed(){for(const element of breakdown.current)void element.refresh().catch(()=>{});setRevision(n=>n+1);onChanged?.();}
 return <div className="nb-asset-page">
  <Button variant="ghost" className="nb-balance-back" onClick={onBack}><span aria-hidden>‹</span> Back to Home</Button>
  <header className="nb-asset-header"><span className={`nb-asset-icon nb-asset-icon--${asset}`} aria-hidden>{asset==='btc'?'₿':'▱'}</span><div><h1>{name}</h1><p>{asset==='btc'?'BTC · Coinbase Wrapped Bitcoin':'XAUT · Tether Gold'}</p></div></header>
  <div className="nb-asset-layout">
   <AssetPriceChart asset={asset}/>
   <aside className="nb-asset-trade" aria-label={`Buy or sell ${name}`}><WalletElement name="convert" options={{accessToken,onBalanceChanged:changed}}/></aside>
   <section className="nb-asset-holdings" aria-label={`Your ${name} holdings`}><div ref={target}/><div className="nb-asset-quantity" ref={quantityTarget}/></section>
  <section className="nb-panel nb-panel--activity nb-asset-activity" aria-label={`${name} activity`}><ScreenLifecycle.Provider value={{active:true,revision}}><WalletElement name="activity" options={{accessToken,currency:asset,canOpenCardTransactionDetails:true,onActivitySelected:({activity}:{activity:LedgerActivity})=>wallet?.createOverlay('activityDetail',{activity}).open()}}/></ScreenLifecycle.Provider></section>
  </div>
 </div>;
}
