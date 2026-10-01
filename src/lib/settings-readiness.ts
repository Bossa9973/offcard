import { createServerFn } from "@tanstack/react-start";
import {
	getRequest,
	getResponseHeaders,
	setResponseHeader,
} from "@tanstack/react-start/server";

import { persistSession, resolveSession } from "./session";
import { userHeaders, WHOP_API } from "./whop";

interface VerificationsRead {
	data?: Array<{ requested_information?: unknown[] | null }> | null;
}

export interface SettingsReadiness {
	hasInformationRequests: boolean;
	source: "fallback" | "verifications";
}

const FALLBACK_READINESS: SettingsReadiness = {
	hasInformationRequests: false,
	source: "fallback",
};

function validateAccount(input: unknown): { accountId: string } {
	if (
		typeof input !== "object" ||
		input === null ||
		!("accountId" in input) ||
		typeof input.accountId !== "string" ||
		!input.accountId.startsWith("biz_")
	) {
		throw new Error("A business account ID is required.");
	}

	return { accountId: input.accountId };
}

function keepRotatedSession(session: Awaited<ReturnType<typeof resolveSession>>): void {
	if (!("tokens" in session) || !session.rotated) return;

	const response = persistSession(new Response(), session);
	const cookie = response.headers.get("Set-Cookie");
	if (cookie) getResponseHeaders().append("Set-Cookie", cookie);
}

export const getSettingsReadiness = createServerFn({ method: "GET" })
	.inputValidator(validateAccount)
	.handler(async ({ data }): Promise<SettingsReadiness> => {
		setResponseHeader("Cache-Control", "private, no-store");

		const session = await resolveSession(getRequest(), data.accountId);
		if (!("tokens" in session)) return FALLBACK_READINESS;
		keepRotatedSession(session);

		try {
			const response = await fetch(
				`${WHOP_API}/verifications?account_id=${encodeURIComponent(data.accountId)}`,
				{ headers: userHeaders(session.tokens.accessToken) },
			);
			if (!response.ok) return FALLBACK_READINESS;

			const verifications = (await response.json()) as VerificationsRead;
			return {
				hasInformationRequests: (verifications.data ?? []).some(
					(verification) =>
						(verification.requested_information?.length ?? 0) > 0,
				),
				source: "verifications",
			};
		} catch {
			return FALLBACK_READINESS;
		}
	});
