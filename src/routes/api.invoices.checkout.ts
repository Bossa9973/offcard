import { createFileRoute } from "@tanstack/react-router";
import { invoiceCheckout } from "../lib/invoice";
import { createCheckout } from "./api.checkout";

export async function createInvoiceCheckout(request: Request) {
 let input: { accountId?: string; invoice?: unknown };
 try { input = await request.json(); } catch { return Response.json({ error: { message: "Invalid invoice." } }, { status: 400 }); }
 try {
  const body = invoiceCheckout(input.accountId ?? "", input.invoice);
  // The existing checkout handler owns authentication, authorization and idempotency.
  // Recalculate on the server: a caller-supplied total is never trusted.
  return createCheckout(new Request(request.url, { method: "POST", headers: request.headers, body: JSON.stringify(body) }), { invoice: true });
 } catch (error) {
  return Response.json({ error: { message: error instanceof Error ? error.message : "Check your invoice." } }, { status: 400 });
 }
}
export const Route = createFileRoute("/api/invoices/checkout")({ server: { handlers: { POST: ({ request }) => createInvoiceCheckout(request) } } });
