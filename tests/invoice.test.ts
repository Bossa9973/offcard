import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { PDFDocument, PDFName, PDFArray, PDFDict, PDFString } from "pdf-lib";
import { invoiceTotals, invoiceCheckout, newInvoice, validateInvoice } from "../src/lib/invoice";
import { invoicePdf } from "../src/ui/invoice-pdf";
import { createInvoiceCheckout } from "../src/routes/api.invoices.checkout";
import { CHECKOUT_SCOPES } from "../src/lib/checkout";
const draft=()=>({...newInvoice(),from:"Example Studio\nhello@example.com",to:"Example Customer\nclient@example.com",items:[{id:"item-1",description:"Design services",quantity:"2.5",price:"199.99"}],discount:"25",tax:"8.25"});
test("invoice uses integer cents, per-line rounding, and tax after discount",()=>{
 assert.deepEqual(invoiceTotals(draft()),{lines:[49998],subtotal:49998,discount:2500,tax:3919,total:51417});
 assert.equal(invoiceCheckout("biz_test",draft()).amount,"514.17");
});
test("invoice refuses invalid totals, dates, blank recipients and oversize input",()=>{
 for(const patch of [{discount:"501"},{tax:"101"},{tax:"1.999"},{to:" "},{due:"2001-01-01"},{issued:"2026-02-31"},{items:[{id:"1",description:"X",quantity:"-1",price:"1"}]},{items:[{id:"1",description:"X",quantity:"1",price:"1000000"}]}]) assert.throws(()=>validateInvoice({...draft(),...patch}));
});
test("invoice checkout recalculates client totals and uses authenticated idempotent checkout",async()=>{
 const original=globalThis.fetch;const calls:{url:string;body:any;headers:Headers}[]=[];
 globalThis.fetch=async(url,init)=>{calls.push({url:String(url),body:JSON.parse(init?.body as string),headers:new Headers(init?.headers)});return Response.json(String(url).endsWith("/products")?{id:"prod_test",account:{id:"biz_test"}}:{id:"ch_test",account_id:"biz_test",purchase_url:"https://whop.com/checkout/ch_test/"});};
 try{
  const tokens={accessToken:"test-only-token",refreshToken:null,expiresAt:Date.now()+3600000,scopes:[...CHECKOUT_SCOPES]};
  const response=await createInvoiceCheckout(new Request("https://neobank.example/api/invoices/checkout",{method:"POST",headers:{Origin:"https://neobank.example","Idempotency-Key":"invoice-test-idempotency-1234",Cookie:`nb_tokens_biz_test=${encodeURIComponent(JSON.stringify(tokens))}`},body:JSON.stringify({accountId:"biz_test",invoice:draft(),amount:"0.01"})}));
  assert.equal(response.status,200);assert.equal(calls[1]!.body.plan.initial_price,514.17);assert.equal(calls[1]!.body.plan.plan_type,"one_time");assert.equal(calls[1]!.body.plan.override_tax_type,"inclusive");assert.equal(calls[1]!.body.plan.stock,1);assert.equal(calls[1]!.body.plan.unlimited_stock,false);assert.match(calls[1]!.headers.get("Idempotency-Key")!,/invoice-test-idempotency-1234/);
 }finally{globalThis.fetch=original;}
});
test("multi-page Inter PDF preserves line items, metadata and a clickable payment link",async()=>{
 const d=draft();d.items=Array.from({length:50},(_,i)=>({id:`item-${i}`,description:`Consultation ${i+1} — Résumé & design review with a detailed deliverable description that wraps onto multiple lines`,quantity:"1",price:"10"}));
 const bytes=await invoicePdf({draft:d,paymentUrl:"https://whop.com/checkout/ch_test/",checkoutId:"ch_test",generatedAt:new Date().toISOString(),sample:false},[await readFile("public/fonts/Inter-Regular.ttf"),await readFile("public/fonts/Inter-SemiBold.ttf")]);
 const doc=await PDFDocument.load(bytes);assert.ok(doc.getPageCount()>1);assert.equal(doc.getTitle(),`Invoice ${d.number}`);
 const links=doc.getPages().flatMap(page=>{const annotations=page.node.lookupMaybe(PDFName.of("Annots"),PDFArray);return annotations?annotations.asArray().map(ref=>{const a=doc.context.lookup(ref,PDFDict);return a.lookup(PDFName.of("A"),PDFDict).lookup(PDFName.of("URI"),PDFString).decodeText();}):[];});
 assert.deepEqual(links,["https://whop.com/checkout/ch_test/"]);
});
