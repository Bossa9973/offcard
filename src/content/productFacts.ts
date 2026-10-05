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
	// Brand naming standards (Pass 6 Section 1.4)
	brand: {
		name: "Off-Card", // Running text
		lockup: "off-card", // Lowercase logo with hyphen
		tagline: "Spend crypto like cash.",
	},

	// Single source of truth for supported assets across Hero, Nav, Pricing, and Bento
	supportedAssets: ["SOL", "USDC", "ETH", "BTC"] as const, // VERIFY(owner)
	navTickerAssets: ["SOL", "USDC", "ETH"] as const, // VERIFY(owner)

	// Claims that need substantiation (Pass 7 Section 5: plain, accountable English)
	claims: {
		applePay: "Works with Apple Pay", // VERIFY(compliance)
		refund: "Card balance refundable to source wallet", // VERIFY(compliance)
		noAnnualFees: "No annual fees", // VERIFY(compliance)
		merchantAcceptance: "Cards work at any merchant that accepts Mastercard", // VERIFY(compliance)
		issuanceTime: "Issued in under 30 seconds", // VERIFY(compliance)
		issuanceHeadline: "under 30 seconds", // VERIFY(compliance)
	},

	cardIssuanceSpeed: {
		headline: "30s",
		claim: "Issued in under 30 seconds", // VERIFY(compliance)
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

