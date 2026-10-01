import { getMarketPrices } from "../src/lib/market-prices.server.ts";
import type { Plugin } from "vite";
import { createDesignApi } from "../src/lib/design-api.ts";

export function designApiPlugin(): Plugin {
	const sample = createDesignApi();
	// Explicit read-only exception: public market prices, with no account or credentials.
	const respond = (request: Request) => new URL(request.url).pathname === "/api/market-prices" ? getMarketPrices(request) : sample(request);
	return {
		name: "neobank-design-api",
		apply: "serve",
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				if (!req.url?.startsWith("/api/")) return next();
				try {
					const chunks: Buffer[] = [];
					for await (const chunk of req) chunks.push(Buffer.from(chunk));
					const request = new Request(new URL(req.url, "http://localhost:5180"), {
						method: req.method,
						headers: { "Content-Type": "application/json", ...(typeof req.headers["idempotency-key"] === "string" ? { "Idempotency-Key": req.headers["idempotency-key"] } : {}) },
						...(chunks.length ? { body: Buffer.concat(chunks).toString() } : {}),
					});
					const response = await respond(request);
					res.writeHead(response.status, Object.fromEntries(response.headers));
					res.end(await response.text());
				} catch {
					res.writeHead(500, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: { message: "Design fixture failed." } }));
				}
			});
		},
	};
}
