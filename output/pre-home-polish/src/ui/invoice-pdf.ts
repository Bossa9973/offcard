import { PDFDocument, PDFName, PDFString, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { invoiceMoney, validateInvoice, type InvoiceRecord } from "../lib/invoice";

export async function invoicePdf(record: InvoiceRecord, fontBytes?: [Uint8Array, Uint8Array]) {
 const { draft: d, totals } = validateInvoice(record.draft);
 const doc = await PDFDocument.create(); doc.registerFontkit(fontkit);
 const bytes = fontBytes ?? await Promise.all(["Inter-Regular.ttf", "Inter-SemiBold.ttf"].map(async name => {
  const res = await fetch(`/fonts/${name}`); if (!res.ok) throw new Error("Could not load the invoice font. Please try again.");
  return new Uint8Array(await res.arrayBuffer());
 })) as [Uint8Array, Uint8Array];
 // Keep the full Inter fonts: fontkit's subset output loses glyph outlines with
 // these fonts even though PDF text extraction still returns the correct text.
 const font = await doc.embedFont(bytes[0], { subset: false });
 const bold = await doc.embedFont(bytes[1], { subset: false });
 const supported = new Set(font.getCharacterSet());
 const content = [d.number, d.from, d.to, d.memo, ...d.items.map(i => i.description)].join("");
 if ([...content].some(char => !/\s/.test(char) && !supported.has(char.codePointAt(0)!))) throw new Error("Some characters are not supported by Inter in this PDF. Update those characters before exporting.");
 doc.setTitle(`Invoice ${d.number}`); doc.setAuthor(d.from.split("\n")[0]!); doc.setSubject(record.sample ? "Sample invoice - not payable" : `Invoice ${d.number}`);
 const ink = rgb(.16,.17,.16), muted = rgb(.46,.46,.46), line = rgb(.87,.87,.87), accent = rgb(.16,.16,.16);
 const W=595.28,H=841.89,M=42,R=W-M; let page=doc.addPage([W,H]); let y=H-M;
 const text=(value:string,x:number,top:number,size=10,f:PDFFont=font,color=ink)=>page.drawText(value,{x,y:top-size,size,font:f,color});
 const rule=(top:number)=>page.drawLine({start:{x:M,y:top},end:{x:R,y:top},color:line,thickness:.6});
 const right=(value:string,x:number,top:number,size=10,f:PDFFont=font)=>text(value,x-f.widthOfTextAtSize(value,size),top,size,f);
 function wrap(value:string,width:number,size=10,f:PDFFont=font) {
  const lines:string[]=[];
  for(const paragraph of value.replace(/\r/g,"").split("\n")) {
   let current="";
   for(const word of paragraph.split(/\s+/)) {
    if(f.widthOfTextAtSize(current ? `${current} ${word}` : word,size)<=width) {current=current ? `${current} ${word}` : word;continue;}
    if(current) lines.push(current);current="";
    for(const char of word) { if(f.widthOfTextAtSize(current+char,size)>width && current){lines.push(current);current="";} current+=char; }
   }
   lines.push(current);
  }
  return lines;
 }
 function background(first:boolean) {
  page.drawRectangle({x:0,y:0,width:W,height:H,color:rgb(1,1,1)});
  text(first ? "Invoice" : `Invoice ${d.number}`,M,H-M,first?30:16,bold);
  if(first)right(d.number,R,H-M+2,12,bold);
  if(record.sample) text("SAMPLE - NOT PAYABLE",M,first?H-84:H-72,9,bold,accent);
  y=first ? H-112 : H-100;
 }
 function ensure(height:number) { if(y-height<60){page=doc.addPage([W,H]);background(false);} }
 background(true);
 const colWidth=154, starts=[M,M+177,M+354];
 const fromLines=wrap(d.from,colWidth), toLines=wrap(d.to,colWidth);
 text("From",starts[0]!,y,9,font,muted);text("Bill to",starts[1]!,y,9,font,muted);text("Dates",starts[2]!,y,9,font,muted);y-=23;
 fromLines.forEach((v,i)=>text(v,starts[0]!,y-i*15));toLines.forEach((v,i)=>text(v,starts[1]!,y-i*15));
 text(`Issued ${d.issued}`,starts[2]!,y);text(`Due ${d.due}`,starts[2]!,y-21);
 y-=Math.max(fromLines.length,toLines.length,3)*15+25;rule(y);y-=18;
 const tableHeader=()=>{text("Item",M,y,9,font,muted);right("Qty",365,y,9);right("Unit price",455,y,9);right("Amount",R,y,9);y-=27;};
 tableHeader();
 d.items.forEach((item,index)=>{
  const lines=wrap(item.description,260);const h=Math.max(1,lines.length)*15+22;
  if(y-h<60){ensure(h);tableHeader();}
  lines.forEach((v,i)=>text(v,M,y-i*15));right(item.quantity,365,y);right(invoiceMoney(Math.round(Number(item.price)*100),d.currency),455,y);right(invoiceMoney(totals.lines[index]!,d.currency),R,y);
  y-=h;rule(y+10);
 });
 y-=15;ensure(155);
 for(const [label,amount] of [["Subtotal",totals.subtotal],["Discount",-totals.discount],[`Tax (${d.tax || "0"}%)`,totals.tax],[`Total (${d.currency.toUpperCase()})`,totals.total]] as const){text(label,320,y,11,label.startsWith("Total")?bold:font);right(invoiceMoney(amount,d.currency),R,y,11,label.startsWith("Total")?bold:font);y-=30;}
 if(d.memo.trim()){y-=16;ensure(50);text("Memo",M,y,9,font,muted);y-=21;for(const v of wrap(d.memo,R-M)){ensure(16);text(v,M,y);y-=15;}}
 y-=28;ensure(145);rule(y);y-=22;text("Payment",M,y,10,bold);y-=23;
 text(record.sample ? "Design preview only. This invoice cannot accept a payment." : `Pay ${invoiceMoney(totals.total,d.currency)} ${d.currency.toUpperCase()} using the link below.`,M,y,10);y-=25;
 const url=record.paymentUrl;
 const buttonWidth=record.sample ? 180 : 140;page.drawRectangle({x:M,y:y-34,width:buttonWidth,height:34,color:accent});
 text(record.sample ? "Preview payment link" : "Pay invoice",M+16,y-8,11,bold,rgb(1,1,1));
 const annotation=doc.context.register(doc.context.obj({Type:"Annot",Subtype:"Link",Rect:[M,y-34,M+buttonWidth,y],Border:[0,0,0],A:{Type:"Action",S:"URI",URI:PDFString.of(url)}}));
 page.node.set(PDFName.of("Annots"),doc.context.obj([annotation]));y-=49;
 for(const v of wrap(url,R-M,8)){ensure(13);text(v,M,y,8,font,muted);y-=13;}
 doc.getPages().forEach((p,i)=>{p.drawText(`${d.number}  /  ${i+1} of ${doc.getPageCount()}`,{x:M,y:27,size:8,font,color:muted});});
 return doc.save();
}
export async function downloadInvoice(record: InvoiceRecord) {
 const bytes=await invoicePdf(record);const blob=new Blob([bytes as BlobPart],{type:"application/pdf"});const url=URL.createObjectURL(blob);
 const anchor=document.createElement("a");anchor.href=url;anchor.download=`${record.sample ? "sample-" : ""}${record.draft.number.replace(/[^a-zA-Z0-9_-]/g,"_")}.pdf`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30_000);
}
