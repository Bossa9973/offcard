import { createServerFn } from "@tanstack/react-start";
import { getRequest, getResponseHeaders, setResponseHeader } from "@tanstack/react-start/server";
import { persistSession, resolveSession } from "./session";

export const getAuthState = createServerFn({ method: "GET" })
	.handler(async () => {
		setResponseHeader("Cache-Control", "private, no-store");
		const session = await resolveSession(getRequest());
		const response = persistSession(new Response(null), session);
		const cookie = response.headers.get("Set-Cookie");
		if (cookie) getResponseHeaders().append("Set-Cookie", cookie);
		return { signedIn: "tokens" in session };
	});
