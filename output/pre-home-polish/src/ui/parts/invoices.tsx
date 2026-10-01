import { AutoTextarea, Button } from "./ui";
import { EmptyState } from "frosted-ui";
import { Document16, Plus16 } from "@frosted-ui/icons";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DESIGN_MODE } from "../../design-mode";
import { CHECKOUT_CURRENCIES, hostedCheckoutUrl } from "../../lib/checkout";
import { invoiceMoney, invoiceTotals, newInvoice, readInvoiceDraft, validateInvoice, type InvoiceBook, type InvoiceDraft, type InvoiceRecord } from "../../lib/invoice";
import { loginHref } from "../../lib/login";

function paymentUrl(value: unknown, sample: boolean): string | null {
 if (!sample) return hostedCheckoutUrl(value);
 if (!DESIGN_MODE || typeof value !== "string") return null;
 try { const url = new URL(value); return url.origin === location.origin && url.pathname === "/api/design/payment-preview" ? url.href : null; } catch { return null; }
}
export function InvoicesScreen({ accountId, onCreated, editor, documentId, onOpen, onBack }: {
 accountId: string; onCreated: () => void; editor: boolean; documentId?: string;
 onOpen: (documentId?: string) => void; onBack: () => void;
}) {
 const storageKey=`neobank-invoices-v1:${DESIGN_MODE ? "sample:" : ""}${accountId}`;
 const [book,setBook]=useState<InvoiceBook|null>(null); const [selected,setSelected]=useState("");
 const [busy,setBusy]=useState(false);const pending=useRef(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const [storageError,setStorageError]=useState(false);const [needsReauth,setNeedsReauth]=useState(false);const alert=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  try {
   const saved=JSON.parse(localStorage.getItem(storageKey)??"null");
   if(saved){
    const draft=readInvoiceDraft(saved.draft);
    if(!Array.isArray(saved.records)||saved.records.length>100)throw new Error("Invalid invoice history");
    const records:InvoiceRecord[]=saved.records.map((record:InvoiceRecord)=>{
     const validated=validateInvoice(record.draft).draft;const url=paymentUrl(record.paymentUrl,record.sample);
     if(!url||typeof record.checkoutId!=="string"||!Number.isFinite(Date.parse(record.generatedAt)))throw new Error("Invalid saved invoice");
     return {...record,draft:validated,paymentUrl:url};
    });
    const attempt=typeof saved.attempt?.body==="string"&&/^[a-zA-Z0-9-]{16,128}$/.test(saved.attempt?.key)?saved.attempt:undefined;
    setBook({draft,records,attempt});return;
   }
  }catch {setStorageError(true);}
  setBook({draft:newInvoice(),records:[]});
 },[storageKey]);
 useEffect(()=>{if(!book)return;try{localStorage.setItem(storageKey,JSON.stringify(book));}catch{setStorageError(true);}},[book,storageKey]);
 useEffect(()=>{if(error)alert.current?.focus();},[error]);
 useEffect(()=>{setSelected(documentId??"");setError("");setNotice("");},[documentId,editor]);
 if(!book)return <p role="status">Opening invoices…</p>;
 const current=book.records.find(r=>r.draft.id===(selected || book.draft.id));const draft=current?.draft??book.draft;const readOnly=!!current;
 let totals:ReturnType<typeof invoiceTotals>|null=null;let calculationError="";
 try{totals=invoiceTotals(draft);}catch(e){calculationError=e instanceof Error?e.message:"Check the amounts.";}
 const money=(amount:number)=>invoiceMoney(amount,draft.currency);
 function update<K extends keyof InvoiceDraft>(field:K,value:InvoiceDraft[K]){setBook(b=>b?{...b,draft:{...b.draft,[field]:value}}:b);setError("");setNotice("");}
 function persist(next:InvoiceBook){setBook(next);try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{setStorageError(true);}}
 async function download(record:InvoiceRecord){const {downloadInvoice}=await import("../invoice-pdf");await downloadInvoice(record);}
 async function submit(event:FormEvent){
  event.preventDefault();if(pending.current||!book)return;setError("");setNeedsReauth(false);setNotice("");
  try{validateInvoice(draft);}catch(e){setError(e instanceof Error?e.message:"Check your invoice.");return;}
  pending.current=true;setBusy(true);
  try{
   if(current){await download(current);setNotice("PDF downloaded.");return;}
   if(book.records.length>=100)throw new Error("This browser has reached 100 saved invoices. Export your existing documents before starting a new archive.");
   const body=JSON.stringify({accountId,invoice:draft});const attempt=book.attempt?.body===body?book.attempt:{body,key:crypto.randomUUID()};
   persist({...book,attempt});
   const response=await fetch("/api/invoices/checkout",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":attempt.key},body,signal:AbortSignal.timeout(25_000)});
   const result=await response.json().catch(()=>null);
   if(!response.ok){setNeedsReauth(result?.needsReauth===true||response.status===401);throw new Error(result?.error?.message??"Could not generate this invoice. Try again to recover the same request.");}
   const url=paymentUrl(result?.purchaseUrl,DESIGN_MODE);
   if(!url||typeof result?.id!=="string")throw new Error("No valid payment link was returned. Retry to recover the same request.");
   const record:InvoiceRecord={draft:structuredClone(draft),checkoutId:result.id,paymentUrl:url,generatedAt:new Date().toISOString(),sample:DESIGN_MODE};
   persist({...book,records:[record,...book.records],attempt:undefined});setSelected(draft.id);onOpen(draft.id);onCreated();
   await download(record);setNotice(DESIGN_MODE?"Sample PDF downloaded. No payment was created.":"Invoice generated and PDF downloaded.");
  }catch(e){setError(e instanceof Error&&e.name!=="TimeoutError"?e.message:"The request timed out. Retry to recover the same payment link.");}
  finally{pending.current=false;setBusy(false);}
 }
 async function copy(){if(!current)return;try{await navigator.clipboard.writeText(current.paymentUrl);setNotice("Payment link copied.");}catch{setError("Copy the payment link shown below.");}}
 function startDraft(){
  if(!book)return;
  if(book.records.some(r=>r.draft.id===book.draft.id)){
   const used=new Set(book.records.map(r=>r.draft.number));let n=book.records.length+1;while(used.has(`INV-${n}`))n++;
   persist({...book,draft:{...newInvoice(`INV-${n}`),from:draft.from,currency:draft.currency},attempt:undefined});
  }
  setSelected("");setNotice("");setError("");onOpen();
 }
 async function recordAction(record:InvoiceRecord, action:"download"|"copy"){
  if(pending.current)return;pending.current=true;setBusy(true);setError("");setNotice("");
  try{if(action==="download"){await download(record);setNotice("PDF downloaded.");}else{await navigator.clipboard.writeText(record.paymentUrl);setNotice("Payment link copied.");}}
  catch(e){setError(e instanceof Error?e.message:"Could not complete that action. Open the invoice to try again.");}
  finally{pending.current=false;setBusy(false);}
 }
 if(!editor){
  const hasDraft=!book.records.some(r=>r.draft.id===book.draft.id);
  const draftStarted=hasDraft&&!!(book.draft.from||book.draft.to||book.draft.items.some(i=>i.description||i.price));
  const records=[...(draftStarted?[{draft:book.draft,record:null}]:[]),...book.records.map(record=>({draft:record.draft,record}))];
  return <section className="nb-invoice-library" aria-label="Invoice documents">
   <div className="nb-section-heading"><h2>Invoices</h2><Button type="button" variant="primary" className="nb-primary-button" onClick={startDraft}>{!draftStarted ? <Plus16 aria-hidden /> : null}{draftStarted?"Continue draft":"New invoice"}</Button></div>
   {storageError?<p role="alert">Browser storage is unavailable. Keep a copy of your PDF.</p>:null}
   {records.length?<div className="nb-data-table-scroll nb-document-table-scroll"><table className="nb-data-table nb-document-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Due date</th><th>Document</th><th><span className="nb-checkout-links-sr">Actions</span></th></tr></thead><tbody>
   {records.map(({draft:row,record})=>{let total="—";try{total=invoiceMoney(invoiceTotals(row).total,row.currency);}catch{}
    return <tr key={row.id}><td><button type="button" className="nb-document-open" onClick={()=>{setSelected(record?row.id:"");onOpen(record?row.id:undefined);}}>{row.number||"Untitled invoice"}</button></td><td>{row.to.split("\n")[0]||"Add customer"}</td><td>{total}</td><td>{row.due ? new Date(`${row.due}T12:00:00`).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" }) : "—"}</td><td><span className="nb-document-state">{record?"Generated":"Draft"}</span></td><td><div className="nb-document-actions">{record?<><Button type="button" variant="secondary" className="nb-secondary-action" disabled={busy} onClick={()=>void recordAction(record,"download")}>Download PDF</Button><Button type="button" variant="secondary" className="nb-secondary-action" disabled={busy} onClick={()=>void recordAction(record,"copy")}>Copy link</Button></>:<Button type="button" variant="secondary" className="nb-secondary-action" onClick={()=>onOpen()}>Edit draft</Button>}</div></td></tr>;
   })}</tbody></table></div>:<div className="nb-checkout-links-empty"><EmptyState.Root><EmptyState.Header><EmptyState.Media variant="soft"><Document16 aria-hidden width={28} height={28} /></EmptyState.Media><EmptyState.Title>No invoices yet</EmptyState.Title><EmptyState.Description>Create an invoice to share with your customer.</EmptyState.Description></EmptyState.Header></EmptyState.Root></div>}
   {error?<p role="alert" ref={alert} tabIndex={-1}>{error}</p>:null}{notice?<p role="status">{notice}</p>:null}
  </section>;
 }
 if(documentId&&!book.records.some(r=>r.draft.id===documentId))return <section className="nb-stack"><p>This invoice is not saved in this browser.</p><Button type="button" variant="ghost" className="nb-text-button" onClick={onBack}>Back to invoices</Button></section>;
 const input=(field:"number"|"issued"|"due"|"tax",label:string,type="text")=><input aria-label={label} type={type} inputMode={field==="tax"?"decimal":undefined} maxLength={field==="number"?20:16} value={draft[field]} readOnly={readOnly} placeholder={field==="tax"?"0":"0.00"} onChange={e=>update(field,e.target.value)} />;
 return <div className="nb-invoices">
  <div className="nb-invoices-toolbar">
   {storageError ? <p role="alert">Could not save your changes. Download your PDF before leaving.</p> : null}
   <Button type="button" variant="secondary" className="nb-invoice-secondary" disabled={busy} onClick={onBack}>Back to invoices</Button>
   {current?<Button type="button" variant="secondary" className="nb-invoice-secondary" disabled={busy} onClick={startDraft}>{book.records.some(r=>r.draft.id===book.draft.id)?"New invoice":"Back to draft"}</Button>:null}
  </div>
  <form onSubmit={submit}>
   <fieldset className="nb-invoice-paper" disabled={busy}>
    <div className="nb-invoice-document-header"><h2>Invoice</h2>{DESIGN_MODE?<span className="nb-invoice-sample">Sample invoice</span>:null}</div>
    <div className="nb-invoice-metadata">
     <label>Invoice number{input("number","Invoice number")}</label>
     <label>Invoice date{input("issued","Invoice date","date")}</label>
     <label>Due date{input("due","Due date","date")}</label>
     <label>Currency<select aria-label="Invoice currency" value={draft.currency} disabled={readOnly} onChange={e=>update("currency",e.target.value)}>{CHECKOUT_CURRENCIES.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}</select></label>
    </div>
    <div className="nb-invoice-parties">
     <label>From<AutoTextarea aria-label="From" placeholder={'Company or your name\nEmail and address'} maxLength={600} rows={3} readOnly={readOnly} value={draft.from} onChange={e=>update("from",e.target.value)} /></label>
     <label>Bill to<AutoTextarea aria-label="Bill to" placeholder={'Customer or company name\nEmail and address'} maxLength={600} rows={3} readOnly={readOnly} value={draft.to} onChange={e=>update("to",e.target.value)} /></label>
    </div>
    <div className="nb-invoice-line-heading" aria-hidden><span>Item</span><span>Qty</span><span>Unit price</span><span>Amount</span><span /></div>
    <div className="nb-invoice-items">{draft.items.map((item,index)=><div className="nb-invoice-line" key={item.id}>
     <label className="nb-invoice-description"><span>Item</span><AutoTextarea aria-label={`Item ${index+1} description`} placeholder="Product or service" rows={1} maxLength={200} readOnly={readOnly} value={item.description} onChange={e=>update("items",draft.items.map(i=>i.id===item.id?{...i,description:e.target.value}:i))} /></label>
     <label><span>Qty</span><input aria-label={`Item ${index+1} quantity`} inputMode="decimal" maxLength={16} readOnly={readOnly} value={item.quantity} onChange={e=>update("items",draft.items.map(i=>i.id===item.id?{...i,quantity:e.target.value}:i))} /></label>
     <label><span>Unit price</span><input aria-label={`Item ${index+1} unit price`} inputMode="decimal" maxLength={16} placeholder="0.00" readOnly={readOnly} value={item.price} onChange={e=>update("items",draft.items.map(i=>i.id===item.id?{...i,price:e.target.value}:i))} /></label>
     <div className="nb-invoice-line-amount"><span>Amount</span><output>{totals?money(totals.lines[index]!):"—"}</output></div>
     {!readOnly?<Button type="button" variant="ghost" className="nb-invoice-remove" aria-label={`Remove item ${index+1}`} disabled={draft.items.length===1} onClick={()=>update("items",draft.items.filter(i=>i.id!==item.id))}>×</Button>:<span />}
    </div>)}</div>
    {!readOnly?<Button variant="ghost" className="nb-invoice-add" type="button" disabled={draft.items.length>=50} onClick={()=>update("items",[...draft.items,{id:crypto.randomUUID(),description:"",quantity:"1",price:""}])}>＋ Add line item</Button>:null}
    <div className="nb-invoice-summary-grid">
     <div className="nb-invoice-options" key={draft.id}>
      <details open={draft.tax !== "" && draft.tax !== "0" ? true : undefined} className="nb-invoice-option"><summary>Tax <span>Optional</span></summary><label>Tax rate (%) {input("tax","Tax percentage")}</label></details>
      <details open={draft.memo ? true : undefined} className="nb-invoice-option"><summary>Note <span>Optional</span></summary><label><span className="nb-checkout-links-sr">Note</span><AutoTextarea aria-label="Memo" placeholder="Payment terms or a note for your customer" maxLength={500} rows={2} readOnly={readOnly} value={draft.memo} onChange={e=>update("memo",e.target.value)} /></label></details>
     </div>
     <div className="nb-invoice-totals">
      <div><span>Subtotal</span><output>{totals?money(totals.subtotal):"—"}</output></div>
      {draft.discount && Number(draft.discount)!==0?<div><span>Discount {!readOnly?<Button variant="ghost" aria-label="Remove discount" onClick={()=>update("discount","")}>Remove</Button>:null}</span><output>−{money(Number(draft.discount)*100)}</output></div>:null}
      {draft.tax && Number(draft.tax)!==0?<div><span>Tax ({draft.tax}%)</span><output>{totals?money(totals.tax):"—"}</output></div>:null}
      <div className="nb-invoice-total"><strong>Total <small>{draft.currency.toUpperCase()}</small></strong><output aria-live="polite" aria-label="Invoice total">{totals?money(totals.total):"—"}</output></div>
      {calculationError?<p className="nb-invoice-calculation-error">{calculationError}</p>:null}
     </div>
    </div>
    <div className="nb-invoice-payment"><p>{DESIGN_MODE ? "Includes a preview payment link. No real payment is created." : "Your PDF includes a payment link for the invoice total."}</p>
     {current?<><a href={current.paymentUrl} target="_blank" rel="noopener noreferrer">{current.paymentUrl}</a><Button variant="secondary" className="nb-invoice-secondary" type="button" onClick={()=>void copy()}>Copy payment link</Button></>:null}
    </div>
   </fieldset>
   {error?<div role="alert" ref={alert} tabIndex={-1} className="nb-invoice-feedback nb-invoice-feedback--error">{error}{needsReauth?<a href={loginHref(accountId,`/account/${accountId}/payments/invoices`)}>Reconnect with Whop</a>:null}</div>:null}
   {notice?<p role="status" className="nb-invoice-feedback">{notice}</p>:null}
   <Button variant="primary" className="nb-invoice-generate" disabled={busy} type="submit">{busy?"Preparing your invoice…":current?"Download PDF again":DESIGN_MODE?"Generate sample invoice":"Generate invoice & download PDF"}<span aria-hidden>↓</span></Button>
  </form>
 </div>;
}
