import { createFileRoute } from "@tanstack/react-router";
import { persistSession, resolveSession, signedOut } from "../lib/session";
import { userHeaders, WHOP_API } from "../lib/whop";

// Only discover an ID. The official WhopCard Element owns card data and secrets.
export async function getFeaturedCard(request: Request): Promise<Response> {
 const accountId = new URL(request.url).searchParams.get("accountId") ?? "";
 const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
 if (!/^biz_[a-zA-Z0-9]+$/.test(accountId)) return json({ error: { message: "Select a valid account." } }, 400);
 const session = await resolveSession(request, accountId);
 if ("failure" in session) return signedOut("Sign in with Whop to view cards.");
 const reply = (body: unknown, status = 200) => persistSession(json(body, status), session);
 if (!session.tokens.scopes.includes("payout:account:read")) return reply({ error: { message: "Reconnect with Whop to view your cards." } }, 403);
 try {
  const url = new URL(`${WHOP_API}/cards`);
  url.searchParams.set("account_id", accountId);
  const response = await fetch(url, { headers: { ...userHeaders(session.tokens.accessToken), "Api-Version-Date": "2026-08-25-2" }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) return reply({ error: { message: "Could not load your card preview. Select a card below or try again." } }, response.status);
  const body = await response.json() as { data?: { id?: string; status?: string }[] };
  if (!Array.isArray(body.data)) return reply({ error: { message: "The card list was unavailable." } }, 502);
  const cards = body.data.filter(card => typeof card.id === "string" && /^icrd_[a-zA-Z0-9]+$/.test(card.id));
  const card = cards.find(card => card.status === "active") ?? cards.find(card => card.status !== "canceled");
  return reply({ cardId: card?.id ?? null });
 } catch { return reply({ error: { message: "Could not load your card preview. Select a card below or try again." } }, 502); }
}

export const Route = createFileRoute("/api/cards/featured")({ server: { handlers: { GET: ({ request }) => getFeaturedCard(request) } } });
