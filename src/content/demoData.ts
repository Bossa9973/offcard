// DEMO DATA: Centralized demo fixtures for Off-Card crypto card product
// All figures, balances, and identifiers below are demonstration fixtures.

export const DEMO_CARDHOLDER = "ALEX MORGAN";
export const DEMO_COMPANY = "ACME LABS";

export interface DemoCardData {
	balance: string;
	subBalance?: string;
	assetBadge?: string;
	networkLabel?: string;
	cardNumber?: string;
	last4: string;
	expiry: string;
	holder: string;
}

// Light Card (Front, Hero visual - Pass 5, Section 1.4)
export const HERO_LIGHT_CARD: DemoCardData = {
	balance: "$5,750.20",
	subBalance: "5,750.20 USDC",
	assetBadge: "USDC",
	networkLabel: "Funded by USDC",
	last4: "7474",
	expiry: "08/28",
	holder: DEMO_CARDHOLDER,
};

// Dark Card (Back, Moneta reference - Pass 5, Section 1.3)
export const HERO_DARK_CARD: DemoCardData = {
	balance: "$5,750.20",
	subBalance: "Available balance",
	networkLabel: "Current balance",
	cardNumber: "5282 3456 7890 2343",
	last4: "2343",
	expiry: "08/28",
	holder: DEMO_CARDHOLDER,
};

// Backward compatibility alias
export const HERO_THIRD_CARD = HERO_DARK_CARD;

// Floating Toasts (Hero cycling payments - Pass 5, Section 4.6)
export interface HeroToastPayment {
	id: string;
	label: string;
	subLabel: string;
	currency: "USDC" | "ETH" | "USDT" | string;
	merchant: string;
	category: string;
}

export const HERO_TOAST_PAYMENTS: readonly HeroToastPayment[] = [
	{
		id: "toast-1",
		label: "Paid $45.00",
		subLabel: "45.00 USDC",
		currency: "USDC",
		merchant: "Design software",
		category: "Subscriptions",
	},
	{
		id: "toast-2",
		label: "Paid $120.00",
		subLabel: "0.038 ETH",
		currency: "ETH",
		merchant: "Cloud hosting",
		category: "Infrastructure",
	},
	{
		id: "toast-3",
		label: "Paid $24.50",
		subLabel: "24.50 USDT",
		currency: "USDT",
		merchant: "Project tools",
		category: "Operations",
	},
] as const;

export const FLOATING_TOAST_DEMO = HERO_TOAST_PAYMENTS[0];

// Bento Tile 1: Spend Limit Meter (Pass 5, Section 2.1)
export const SPEND_LIMIT_DEMO = {
	label: "Marketing team card",
	spent: "$1,240",
	limit: "$5,000",
	copy: "$1,240 of $5,000 this month",
	percentage: 24.8, // 25% progress
} as const;

// Assets Bento Tile (Pass 5, Section 2 & 4.5: Real SVG icons & live tick)
export interface CryptoAssetItem {
	code: string;
	name: string;
	amount: string;
	numericValue: number;
}

export const SAMPLE_CRYPTO_ASSETS: readonly CryptoAssetItem[] = [
	{ code: "USDC", name: "USD Coin", amount: "$428,950.00", numericValue: 428950 },
	{ code: "USDT", name: "Tether", amount: "$185,240.00", numericValue: 185240 },
	{ code: "ETH", name: "Ether", amount: "$94,110.00", numericValue: 94110 },
	{ code: "BTC", name: "Bitcoin", amount: "$38,420.00", numericValue: 38420 },
] as const;

// Compatibility alias for existing UI hooks
export const SAMPLE_BALANCES = SAMPLE_CRYPTO_ASSETS.map((asset) => ({
	code: asset.code,
	name: asset.name,
	amount: asset.amount,
	symbol: asset.code,
}));

export const ASSETS_TILE_META = {
	heading: "Spend what you hold",
	lead: "Hold major crypto balances. Automatically converted at checkout.",
	sampleLabel: "Sample balances",
	// VERIFY: Confirm conversion takes place at transaction authorization
	caption: "Converted at spend",
} as const;

// Settlement Bento Tile (Pass 5, Section 2.2: 3-step vertical timeline)
export const SETTLEMENT_STEPS = [
	{ step: "Authorized", time: "14:02:11", status: "completed" },
	{ step: "Converted", time: "14:02:12", status: "completed" },
	{ step: "Cleared", time: "14:02:14", hash: "ref_7a3f91c4", status: "settled" },
] as const;

export const SETTLEMENT_DEMO = {
	heading: "Direct treasury settlement",
	body: "Instant card transactions cleared directly from your wallet balance with itemized tracking.",
	merchant: "Cloud hosting",
	amount: "-$1,240.00",
	subAmount: "1,240.00 USDC",
	txHash: "ref_7a3f91c4",
	status: "Settled",
} as const;

// Accounting Bento Tile (Pass 5, Section 5.5: Neutral merchant names)
export const SAMPLE_LEDGER_ROWS = [
	{
		date: "Oct 12",
		merchant: "Design software",
		txHash: "ref_4b1e72a9",
		category: "Software & Subscriptions",
		amount: "-$45.00",
		status: "Settled",
	},
	{
		date: "Oct 11",
		merchant: "Cloud hosting",
		txHash: "ref_7a3f91c4",
		category: "Cloud Infrastructure",
		amount: "-$1,240.00",
		status: "Settled",
	},
	{
		date: "Oct 10",
		merchant: "Project tools",
		txHash: "ref_91d238f0",
		category: "Project Management",
		amount: "-$120.00",
		status: "Settled",
	},
] as const;

export const SAMPLE_LEDGER_ROW = SAMPLE_LEDGER_ROWS[0];

// Pricing Plans
export const PRICING_PLANS = [
	{
		id: "starter",
		name: "Starter",
		price: "$0",
		period: "/month",
		description: "For web3 teams and founders getting started.",
		features: [
			"Up to 5 virtual crypto debit cards",
			"Instant USDC & USDT funding",
			"Standard receipt upload & categorization",
			"Community support",
		],
		cta: "Open account",
		variant: "outline-light" as const,
		featured: false,
	},
	{
		id: "growth",
		name: "Growth",
		price: "$29",
		period: "/month",
		description: "For active crypto-native businesses and distributed teams.",
		features: [
			"Unlimited virtual and physical metal cards",
			"Multi-asset spending (USDC, USDT, ETH)",
			"Custom merchant & category spend limits",
			"Export-ready ledger records (QuickBooks & Xero)",
			"Sub-account team balances",
		],
		cta: "Open account",
		variant: "dark" as const,
		featured: true,
	},
	{
		id: "scale",
		name: "Scale",
		price: "$99",
		period: "/month",
		description: "For high-volume operations requiring programmatic control.",
		features: [
			"Everything in Growth",
			"Full programmatic REST API & webhooks",
			"Enterprise treasury controls & priority limits",
			"Dedicated account manager",
			"Custom enterprise SLA",
		],
		cta: "Talk to sales",
		variant: "outline-light" as const,
		featured: false,
	},
] as const;

// FAQ Questions
export const FAQ_QUESTIONS = [
	{
		id: "issuing-speed",
		question: "How quickly can I issue my first card?",
		answer: "Virtual cards are provisioned in under 30 seconds once business verification is complete. Physical metal cards ship within 3 business days.",
	},
	{
		id: "funds-custody",
		question: "How are my funds held?",
		answer: "Funds are maintained in segregated institutional accounts and qualified digital asset custody partners. Digital assets are not insured by the FDIC or SIPC.",
	},
	{
		id: "api-integration",
		question: "Can I programmatically issue cards via API?",
		answer: "Yes. Scale tier customers have full programmatic REST API access to create virtual cards, set spending limits, and listen to transaction webhooks.",
	},
	{
		id: "conversion-settlement",
		question: "How does currency conversion work at checkout?",
		answer: "When your team pays at any merchant terminal, your card draws directly against your designated crypto or cash balance, converting at the network rate with zero manual pre-funding.",
	},
] as const;

