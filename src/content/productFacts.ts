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
	// VERIFY: Confirm virtual card provisioning speed in production
	cardIssuanceSpeed: {
		headline: "30s",
		copy: "Virtual cards issued in under thirty seconds with automated spend limits.",
		status: "VERIFY",
		notes: "Requires business identity verification before issuance.",
	},

	// VERIFY: Substantiate 0% foreign exchange markup claim.
	// Crypto-to-fiat conversion normally incurs an exchange spread or network fee.
	fxMarkup: {
		headline: "0%",
		copy: "Foreign exchange markup on supported asset spending.",
		status: "VERIFY",
		notes: "Spread or network fee disclosure may be legally required depending on jurisdiction.",
	},

	// VERIFY: Confirm conversion takes place at or before point of sale
	conversionMechanism: {
		label: "Converted at spend",
		notes: "Assumes crypto is converted to fiat currency at authorization time.",
	},

	// VERIFY: Confirm on-chain settlement mechanism and network
	settlement: {
		heading: "Every spend, settled on-chain",
		body: "Card payments cleared with transparent on-chain records for business accounting.",
		notes: "Confirm which blockchain network or L2 ledger is used for transaction settlement.",
	},

	// VERIFY: Confirm live accounting integrations
	accountingIntegrations: {
		providers: ["QuickBooks", "Xero"],
		status: "VERIFY",
		notes: "Confirm direct API sync or CSV export capabilities.",
	},

	// VERIFY: Onboarding time claim
	onboardingTime: {
		headline: "Open your account in five minutes",
		body: "Verify your business and issue your first virtual card.",
		status: "VERIFY",
		notes: "Subject to KYC/KYB identity verification speed.",
	},

	// TODO(compliance): Custody details placeholder
	// Crypto assets are generally NOT FDIC-insured. Never imply depository insurance.
	custody: {
		question: "How are my funds held?",
		answer: "Details on custody and protection of funds will be provided here.",
		notes: "// TODO(compliance): Replace with qualified custodian disclosure (custodial or self-custody partner).",
	},

	// Compliant regulatory risk disclosure for footer (merged single disclosure)
	riskDisclosure: {
		text: "Crypto assets are volatile and not insured by the FDIC or SIPC. Off-Card is a financial technology platform, not a bank. Cards are issued pursuant to licenses from payment card networks.",
		notes: "Single clean disclosure block without placeholder brackets.",
	},
} as const;
