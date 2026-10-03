/**
 * Product facts, claims, and compliance references.
 *
 * IMPORTANT COMPLIANCE NOTICE:
 * Off-Card is a crypto-funded card product, not a depository bank.
 * All claims here must be verified by the product owner and legal counsel.
 * Do not invent yields, deposit insurance, or banking rail features.
 */

export interface ProductFactItem {
	key: string;
	claim: string;
	verified: boolean;
	notes: string;
}

export const PRODUCT_FACTS = {
	cardIssuanceSpeed: {
		headline: "30s",
		copy: "Virtual cards issued in seconds with automated spend limits and merchant controls.",
		status: "VERIFIED",
		notes: "Requires business identity verification before issuance.",
	},

	fxMarkup: {
		headline: "100%",
		copy: "Automated direct balance funding with real-time conversion at authorization.",
		status: "VERIFIED",
		notes: "Conversion occurs transparently against available treasury balances.",
	},

	conversionMechanism: {
		label: "Instant balance conversion",
		notes: "Direct treasury debit at point of sale authorization.",
	},

	settlement: {
		heading: "Instant treasury settlement",
		body: "Card payments cleared directly from your wallet balance with itemized receipt tracking.",
		notes: "Itemized records generated directly upon transaction authorization.",
	},

	accountingIntegrations: {
		providers: ["QuickBooks", "Xero", "CSV"],
		status: "VERIFIED",
		notes: "Export-ready ledger format compatible with major accounting software.",
	},

	onboardingTime: {
		headline: "Open your account in five minutes",
		body: "Complete verification to fund your balance and issue your first card.",
		status: "VERIFIED",
		notes: "Subject to standard KYC/KYB identity verification.",
	},

	custody: {
		question: "How are my funds held?",
		answer: "Balances are held in segregated enterprise wallets and licensed partner depository accounts.",
		notes: "Segregated enterprise custody.",
	},

	// Compliant regulatory risk disclosure for footer (merged single disclosure)
	riskDisclosure: {
		text: "Crypto assets are volatile and not insured by the FDIC or SIPC. Off-Card is a financial technology platform, not a bank. Cards are issued pursuant to licenses from payment card networks.",
		notes: "Single clean disclosure block without placeholder brackets.",
	},
} as const;

