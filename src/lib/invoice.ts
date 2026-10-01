import { CHECKOUT_CURRENCIES } from "./checkout";

export interface InvoiceItem { id: string; description: string; quantity: string; price: string }
export interface InvoiceDraft {
 id: string; number: string; currency: string; from: string; to: string;
 issued: string; due: string; items: InvoiceItem[]; discount: string; tax: string; memo: string;
}
export interface InvoiceRecord { draft: InvoiceDraft; checkoutId: string; paymentUrl: string; generatedAt: string; sample: boolean }
export interface InvoiceBook { draft: InvoiceDraft; records: InvoiceRecord[]; attempt?: { body: string; key: string } }
const MAX_MINOR = 99_999_999;
function decimal(value: string, places: number, label: string): number {
 if (!new RegExp(`^\\d{1,9}(\\.\\d{1,${places}})?$`).test(value.trim())) throw new Error(`${label}: enter a positive number with up to ${places} decimal places.`);
 const [whole, fraction = ""] = value.trim().split(".");
 const result = Number(whole) * 10 ** places + Number(fraction.padEnd(places, "0"));
 if (!Number.isSafeInteger(result)) throw new Error(`${label} is too large.`);
 return result;
}
export function invoiceTotals(draft: InvoiceDraft) {
 const lines = draft.items.map((item, i) => {
  const quantity = decimal(item.quantity, 3, `Item ${i + 1} quantity`);
  const price = decimal(item.price || "0", 2, `Item ${i + 1} price`);
  if (!quantity || quantity > 10_000_000 || price > MAX_MINOR) throw new Error(`Check the quantity and price of item ${i + 1}.`);
  return Math.floor((quantity * price + 500) / 1000);
 });
 const subtotal = lines.reduce((sum, line) => sum + line, 0);
 const discount = decimal(draft.discount || "0", 2, "Discount");
 const rate = decimal(draft.tax || "0", 2, "Tax");
 if (discount > subtotal) throw new Error("Discount cannot exceed the subtotal.");
 if (rate > 10_000) throw new Error("Tax must be between 0 and 100%.");
 const tax = Math.floor(((subtotal - discount) * rate + 5000) / 10_000);
 const total = subtotal - discount + tax;
 if (!Number.isSafeInteger(total) || total > MAX_MINOR) throw new Error("Invoice total must be below 1,000,000.");
 return { lines, subtotal, discount, tax, total };
}
export function readInvoiceDraft(input: unknown): InvoiceDraft {
 if (!input || typeof input !== "object") throw new Error("Invalid invoice.");
 const d = input as Record<string, unknown>;
 for (const [key, max] of Object.entries({ id: 64, number: 20, currency: 3, from: 600, to: 600, issued: 10, due: 10, discount: 16, tax: 8, memo: 500 })) {
  if (typeof d[key] !== "string" || (d[key] as string).length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(d[key] as string)) throw new Error(`Check the invoice ${key}.`);
 }
 if (!/^[a-zA-Z0-9-]{16,64}$/.test(d.id as string) || !CHECKOUT_CURRENCIES.includes(d.currency as typeof CHECKOUT_CURRENCIES[number])) throw new Error("Invalid invoice identifier or currency.");
 if (!Array.isArray(d.items) || !d.items.length || d.items.length > 50) throw new Error("Add between 1 and 50 line items.");
 const items = d.items.map((item): InvoiceItem => {
  if (!item || typeof item !== "object" || typeof item.id !== "string" || item.id.length > 64 || typeof item.description !== "string" || item.description.length > 200 || typeof item.quantity !== "string" || item.quantity.length > 16 || typeof item.price !== "string" || item.price.length > 16) throw new Error("Check your line items.");
  return { id: item.id, description: item.description, quantity: item.quantity, price: item.price };
 });
 return { id: d.id, number: d.number, currency: d.currency, from: d.from, to: d.to, issued: d.issued, due: d.due, discount: d.discount, tax: d.tax, memo: d.memo, items } as InvoiceDraft;
}
export function validateInvoice(input: unknown) {
 const draft = readInvoiceDraft(input);
 if (!draft.number.trim() || !draft.from.trim() || !draft.to.trim()) throw new Error("Add an invoice number, sender, and customer.");
 for (const date of [draft.issued, draft.due]) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error("Choose valid invoice and due dates.");
 }
 if (draft.due < draft.issued) throw new Error("Due date cannot be before the invoice date.");
 if (draft.items.some(item => !item.description.trim())) throw new Error("Give each line item a description.");
 const totals = invoiceTotals(draft);
 if (totals.total <= 0) throw new Error("Invoice total must be greater than zero.");
 return { draft, totals };
}
export function invoiceCheckout(accountId: string, input: unknown) {
 const { draft, totals } = validateInvoice(input);
 return { accountId, title: `Invoice ${draft.number.trim()}`, description: `Invoice ${draft.number.trim()} • Due ${draft.due}`, amount: (totals.total / 100).toFixed(2), currency: draft.currency, billing: "one_time", redirectUrl: "" };
}
export function newInvoice(number = "INV-1"): InvoiceDraft {
 const today = new Date(); const due = new Date(); due.setDate(due.getDate() + 14);
 const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
 return { id: crypto.randomUUID(), number, currency: "usd", from: "", to: "", issued: localDate(today), due: localDate(due), items: [{ id: crypto.randomUUID(), description: "", quantity: "1", price: "" }], discount: "", tax: "", memo: "" };
}
export const invoiceMoney = (minor: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
