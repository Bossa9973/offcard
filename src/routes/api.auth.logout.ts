import { createFileRoute } from "@tanstack/react-router";

import { clearCookie, COOKIE } from "../lib/oauth";

export const Route = createFileRoute("/api/auth/logout")({
	server: {
		handlers: {
			POST: ({ request }) => {
				const names = new Set<string>([COOKIE.tokens]);
				for (const part of (request.headers.get("cookie") ?? "").split(";")) {
					const name = part.trim().split("=", 1)[0];
					if (name.startsWith(`${COOKIE.tokens}_biz_`)) names.add(name);
				}

				return new Response(null, {
					headers: [
						["Location", "/"],
						...[...names].map(
							(name) => ["Set-Cookie", clearCookie(name)] as [string, string],
						),
					],
					status: 303,
				});
			},
		},
	},
});
