import {readFile,writeFile} from 'node:fs/promises';
import {invoicePdf} from '../../src/ui/invoice-pdf';
const bytes=await invoicePdf({draft:{id:'34e0a91d-c0df-4acc-8ec3-096cf668e174',number:'INV-100',currency:'usd',from:'Kevin',to:'alec',issued:'2026-09-22',due:'2026-10-06',items:[{id:'1',description:'testing',quantity:'1',price:'100'}],discount:'0',tax:'0',memo:''},paymentUrl:'http://localhost:5180/api/design/payment-preview?invoice=34e0a91d-c0df-4acc-8ec3-096cf668e174',checkoutId:'sample',generatedAt:'2026-09-23T00:08:59Z',sample:true},[await readFile('public/fonts/Inter-Regular.ttf'),await readFile('public/fonts/Inter-SemiBold.ttf')]);
await writeFile('output/pdf/sample-INV-100-fixed.pdf',bytes);
