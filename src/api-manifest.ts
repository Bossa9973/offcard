import { selectManifest } from "@whop/template-kit";

// Catalog allowlist kept for preview / leftover kit surfaces. Withdraw now reads through
// /api/withdraw with the user's OAuth token rather than this company-key proxy.
export const NEOBANK_ELEMENTS_MANIFEST = selectManifest([
	"getAccount",
	"listPayoutMethods",
	"listPayouts",
	"createPayout",
]);
