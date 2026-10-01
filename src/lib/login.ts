export function isSafeReturnPath(path: string): boolean {
	return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

export function loginHref(accountId: string | undefined, returnTo?: string): string {
	const params = new URLSearchParams();
	if (accountId?.startsWith("biz_")) params.set("account_id", accountId);
	if (returnTo && isSafeReturnPath(returnTo)) params.set("return_to", returnTo);
	const query = params.toString();
	return query ? `/api/auth/login?${query}` : "/api/auth/login";
}
