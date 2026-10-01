import { PDFDocument, PDFName, PDFString, rgb, type PDFFont, type RGB } from "pdf-lib";
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
 // Inter's contextual alternates (case-sensitive hyphens and parentheses beside digits) swap in
 // glyphs that pdf-lib measures with the wrong advance, leaving visible gaps. Turn them off.
 const features = { calt: false, case: false };
 const font = await doc.embedFont(bytes[0], { subset: false, features });
 const bold = await doc.embedFont(bytes[1], { subset: false, features });
 const supported = new Set(font.getCharacterSet());
 const content = [d.number, d.from, d.to, d.memo, ...d.items.map(i => i.description)].join("");
 if ([...content].some(char => !/\s/.test(char) && !supported.has(char.codePointAt(0)!))) throw new Error("Some characters are not supported by Inter in this PDF. Update those characters before exporting.");
 doc.setTitle(`Invoice ${d.number}`); doc.setAuthor(d.from.split("\n")[0]!); doc.setSubject(record.sample ? "Sample invoice - not payable" : `Invoice ${d.number}`);
 const ink=rgb(.1,.1,.11), muted=rgb(.45,.45,.47), faint=rgb(.62,.62,.64), line=rgb(.9,.9,.91), wash=rgb(.965,.965,.97), white=rgb(1,1,1);
 const W=595.28,H=841.89,M=48,R=W-M,BOTTOM=72; let page=doc.addPage([W,H]); let y=H-M;
 const money=(minor:number)=>invoiceMoney(minor,d.currency), currency=d.currency.toUpperCase();
 const date=(iso:string)=>new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"});
 const text=(value:string,x:number,top:number,size=10,f:PDFFont=font,color=ink)=>page.drawText(value,{x,y:top-size,size,font:f,color});
 const right=(value:string,x:number,top:number,size=10,f:PDFFont=font,color=ink)=>text(value,x-f.widthOfTextAtSize(value,size),top,size,f,color);
 const rule=(top:number,from=M,to=R,color=line,thickness=.75)=>page.drawLine({start:{x:from,y:top},end:{x:to,y:top},color,thickness});
 // Rounded rectangle from its top-left corner (SVG paths draw downward from y).
 const box=(x:number,top:number,width:number,height:number,radius:number,options:{color?:RGB;borderColor?:RGB;borderWidth?:number})=>page.drawSvgPath(`M${radius} 0H${width-radius}A${radius} ${radius} 0 0 1 ${width} ${radius}V${height-radius}A${radius} ${radius} 0 0 1 ${width-radius} ${height}H${radius}A${radius} ${radius} 0 0 1 0 ${height-radius}V${radius}A${radius} ${radius} 0 0 1 ${radius} 0Z`,{x,y:top,...options});
 // Keeps both ends of a long link readable instead of wrapping it mid-token.
 const fit=(value:string,width:number,size:number,f:PDFFont=font)=>{
  const clip=(keep:number)=>`${value.slice(0,Math.ceil(keep/2))}…${value.slice(value.length-Math.floor(keep/2))}`;
  if(f.widthOfTextAtSize(value,size)<=width)return value;
  let keep=value.length;while(keep>8&&f.widthOfTextAtSize(clip(keep),size)>width)keep--;
  return clip(keep);
 };
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
  page.drawRectangle({x:0,y:0,width:W,height:H,color:white});
  if(!first){text(`Invoice ${d.number}`,M,H-M,11,bold);right("Continued",R,H-M,9,font,muted);y=H-M-36;return;}
  text("Invoice",M,H-M,28,bold);
  right(d.number,R,H-M+1,11,bold);
  right(`Issued ${date(d.issued)}`,R,H-M-17,9,font,muted);
  right(`Due ${date(d.due)}`,R,H-M-31,9,font,muted);
  if(record.sample){
   const label="SAMPLE · NOT PAYABLE",size=7.5,width=bold.widthOfTextAtSize(label,size)+16;
   box(M,H-M-42,width,17,8.5,{borderColor:faint,borderWidth:.75});
   text(label,M+8,H-M-47,size,bold,muted);
  }
  y=H-M-92;
 }
 function ensure(height:number) { if(y-height<BOTTOM){page=doc.addPage([W,H]);background(false);return true;} return false; }
 background(true);

 // Parties and the amount due.
 const colWidth=150, starts=[M,M+170,M+340];
 const fromLines=wrap(d.from,colWidth), toLines=wrap(d.to,colWidth);
 text("From",starts[0]!,y,8.5,font,muted);text("Bill to",starts[1]!,y,8.5,font,muted);text("Amount due",starts[2]!,y,8.5,font,muted);y-=20;
 fromLines.forEach((v,i)=>text(v,starts[0]!,y-i*14.5,10,i===0?bold:font));toLines.forEach((v,i)=>text(v,starts[1]!,y-i*14.5,10,i===0?bold:font));
 text(money(totals.total),starts[2]!,y-1,20,bold);text(`${currency} · due ${date(d.due)}`,starts[2]!,y-28,9,font,muted);
 y-=Math.max(fromLines.length,toLines.length,3)*14.5+30;

 // Line items.
 const QTY=372,PRICE=462;
 const tableHeader=()=>{rule(y,M,R,ink,.75);y-=12;text("Description",M,y,8.5,font,muted);right("Qty",QTY,y,8.5,font,muted);right("Unit price",PRICE,y,8.5,font,muted);right("Amount",R,y,8.5,font,muted);y-=17;rule(y);y-=13;};
 tableHeader();
 d.items.forEach((item,index)=>{
  const lines=wrap(item.description,270);const h=Math.max(1,lines.length)*14.5+19;
  if(ensure(h))tableHeader();
  lines.forEach((v,i)=>text(v,M,y-i*14.5));right(item.quantity,QTY,y);right(money(Math.round(Number(item.price)*100)),PRICE,y);right(money(totals.lines[index]!),R,y);
  y-=h;rule(y+13);
 });
 y-=8;

 // Totals, aligned under the quantity and price columns.
 ensure(120);const LABEL=QTY-50;
 const rows:[string,string][]=[["Subtotal",money(totals.subtotal)]];
 if(totals.discount)rows.push(["Discount",`−${money(totals.discount)}`]);
 if(totals.tax||Number(d.tax))rows.push([`Tax (${d.tax || "0"}%)`,money(totals.tax)]);
 for(const [label,value] of rows){text(label,LABEL,y,10,font,muted);right(value,R,y);y-=22;}
 y+=4;rule(y,LABEL,R,ink,.75);y-=12;
 text(`Total (${currency})`,LABEL,y,11.5,bold);right(money(totals.total),R,y,11.5,bold);y-=40;

 if(d.memo.trim()){ensure(50);text("Notes",M,y,8.5,font,muted);y-=19;for(const v of wrap(d.memo,R-M)){ensure(16);text(v,M,y);y-=14.5;}y-=22;}

 // Payment panel: explanation and link on the left, one button on the right.
 ensure(96);
 const url=record.paymentUrl, panelH=78, pad=18;
 const label=record.sample ? "Preview payment link" : "Pay invoice", labelSize=10.5, buttonW=bold.widthOfTextAtSize(label,labelSize)+36, buttonH=34;
 const buttonX=R-pad-buttonW, buttonTop=y-(panelH-buttonH)/2, textW=buttonX-M-pad*2;
 box(M,y,R-M,panelH,10,{color:wash});
 text(record.sample ? "Payment preview" : "Pay online",M+pad,y-17,10.5,bold);
 text(fit(record.sample ? "Design preview only. This invoice cannot accept a payment." : `Pay ${money(totals.total)} ${currency} through the secure checkout.`,textW,9),M+pad,y-35,9,font,muted);
 text(fit(url.replace(/^https?:\/\//,""),textW,8),M+pad,y-51,8,font,faint);
 box(buttonX,buttonTop,buttonW,buttonH,8,{color:ink});
 page.drawText(label,{x:buttonX+(buttonW-bold.widthOfTextAtSize(label,labelSize))/2,y:buttonTop-buttonH/2-labelSize*.36,size:labelSize,font:bold,color:white});
 const annotation=doc.context.register(doc.context.obj({Type:"Annot",Subtype:"Link",Rect:[buttonX,buttonTop-buttonH,buttonX+buttonW,buttonTop],Border:[0,0,0],A:{Type:"Action",S:"URI",URI:PDFString.of(url)}}));
 page.node.set(PDFName.of("Annots"),doc.context.obj([annotation]));y-=panelH;

 const sender=d.from.split("\n")[0]!.trim();
 doc.getPages().forEach((p,i)=>{
  p.drawLine({start:{x:M,y:48},end:{x:R,y:48},color:line,thickness:.75});
  p.drawText([sender,`Invoice ${d.number}`].filter(Boolean).join("  ·  "),{x:M,y:32,size:8,font,color:faint});
  const pageLabel=`Page ${i+1} of ${doc.getPageCount()}`;p.drawText(pageLabel,{x:R-font.widthOfTextAtSize(pageLabel,8),y:32,size:8,font,color:faint});
 });
 return doc.save();
}
export async function downloadInvoice(record: InvoiceRecord) {
 const bytes=await invoicePdf(record);const blob=new Blob([bytes as BlobPart],{type:"application/pdf"});const url=URL.createObjectURL(blob);
 const anchor=document.createElement("a");anchor.href=url;anchor.download=`${record.sample ? "sample-" : ""}${record.draft.number.replace(/[^a-zA-Z0-9_-]/g,"_")}.pdf`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30_000);
}
