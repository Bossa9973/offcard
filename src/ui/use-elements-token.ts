import { useEffect, useState } from "react";

export interface ElementsToken {
	canReadPayments: boolean;
	accountId: string | undefined;
	token: string | undefined;
	error: string | undefined;
	isLoading: boolean;
	/** No usable Whop session — the app should offer sign-in rather than an error. */
	needsSignIn: boolean;
}

const REFRESH_FRACTION = 0.8;
const MIN_REFRESH_MS = 30_000;

const PENDING: ElementsToken = {
	canReadPayments: false,
	accountId: undefined,
	error: undefined,
	isLoading: true,
	needsSignIn: false,
	token: undefined,
};

function failure(message: string, needsSignIn = false): ElementsToken {
	return {
		canReadPayments: false,
		accountId: undefined,
		error: message,
		isLoading: false,
		needsSignIn,
		token: undefined,
	};
}

type MintResult =
	| { ok: true; accountId: string; expiresAt: string; token: string; canReadPayments: boolean }
	| { ok: false; message: string; signedIn: boolean | undefined };

let mintChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(run: () => Promise<T>): Promise<T> {
	const next = mintChain.then(run, run);
	mintChain = next.catch(() => undefined);
	return next;
}

const inflight = new Map<string, Promise<MintResult>>();

function requestMint(
	accountId?: string,
): Promise<MintResult> {
	const key = accountId ?? "personal";
	const pending = inflight.get(key);
	if (pending) return pending;

	const next = enqueue(() =>
		fetch("/api/token", {
			body: JSON.stringify({ accountId }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		}),
	)
		.then(async (response): Promise<MintResult> => {
			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					error?: { message?: string };
					signedIn?: boolean;
				} | null;
				return {
					ok: false,
					message:
						body?.error?.message ?? `Token request failed (${response.status}).`,
					signedIn: body?.signedIn,
				};
			}
			const { accountId, expiresAt, token, canReadPayments } = (await response.json()) as {
				canReadPayments?: boolean;
				accountId: string;
				expiresAt: string;
				token: string;
			};
			return { ok: true, accountId, expiresAt, token, canReadPayments: canReadPayments === true };
		})
		.finally(() => {
			inflight.delete(key);
		});
	inflight.set(key, next);
	return next;
}

export function useElementsToken(
	accountId?: string,
	enabled = true,
): ElementsToken {
	const scopeKey = `${enabled ? "enabled" : "disabled"}:${accountId ?? "personal"}`;
	const [snapshot, setSnapshot] = useState<{
		scopeKey: string;
		value: ElementsToken;
	}>({ scopeKey, value: PENDING });
	const state = snapshot.scopeKey === scopeKey ? snapshot.value : PENDING;

	useEffect(() => {
		if (!enabled) {
			setSnapshot({
				scopeKey,
				value: { ...PENDING, isLoading: false },
			});
			return;
		}

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let minted = false;
		setSnapshot({ scopeKey, value: PENDING });

		function degrade(message: string, needsSignIn: boolean): void {
			if (needsSignIn) {
				setSnapshot({ scopeKey, value: failure(message, true) });
				return;
			}

			if (minted) {
				setSnapshot((previous) => ({
					scopeKey,
					value: {
						...(previous.scopeKey === scopeKey ? previous.value : PENDING),
						error: message,
					},
				}));
				timer = setTimeout(() => void mint(), MIN_REFRESH_MS);
				return;
			}
			setSnapshot({ scopeKey, value: failure(message) });
		}

		async function mint(): Promise<void> {
			try {
				const result = await requestMint(accountId);
				if (cancelled) return;

				if (!result.ok) {
					degrade(result.message, result.signedIn === false);
					return;
				}

				minted = true;
				setSnapshot({
					scopeKey,
					value: {
						accountId: result.accountId,
						canReadPayments: result.canReadPayments,
						error: undefined,
						isLoading: false,
						needsSignIn: false,
						token: result.token,
					},
				});

				// The mint defaults to an hour and caps at three, so a tab left open outlives
				// its token unless we re-mint ahead of the expiry.
				const lifetime = Date.parse(result.expiresAt) - Date.now();
				if (Number.isFinite(lifetime))
					timer = setTimeout(
						() => void mint(),
						Math.max(MIN_REFRESH_MS, lifetime * REFRESH_FRACTION),
					);
			} catch (error) {
				if (cancelled) return;
				degrade(
					error instanceof Error ? error.message : "Token request failed.",
					false,
				);
			}
		}

		void mint();
		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	}, [accountId, enabled, scopeKey]);

	return state;
}
