export const TABS = [
	{ key: "overview", label: "Home" },
	{ key: "cards", label: "Cards" },
	{ key: "invoicing", label: "Payments" },
	{ key: "report", label: "Reports" },
] as const;

// Money tasks retain their direct URLs for compatibility and verification gates,
// but are no longer primary navigation destinations.
export type MoneyTab = (typeof TABS)[number]["key"] | "invoices" | "deposit" | "send" | "withdraw";
export type TabKey = MoneyTab | "settings" | "verification";

export const TAB_TITLES: Record<TabKey, string> = {
	deposit: "Deposit",
	cards: "Cards",
	invoicing: "Payments",
	invoices: "Invoices",
	overview: "Home",
	report: "Reports",
	send: "Send money",
	settings: "Settings",
	verification: "Verify your identity",
	withdraw: "Withdraw",
};

export const TAB_SLUGS: Record<string, TabKey> = {
	payments: "invoicing",
	"payments/links": "invoicing",
	"payments/invoices": "invoices",
	"payments/invoices/edit": "invoices",
	reports: "report",
	"reports/activity": "report",
	cards: "cards",
	invoicing: "invoicing",
	invoices: "invoices",
	deposit: "deposit",
	report: "report",
	send: "send",
	settings: "settings",
	verification: "verification",
	withdraw: "withdraw",
};

export const SLUG_FOR_TAB: Record<TabKey, string> = {
	deposit: "deposit",
	cards: "cards",
	invoicing: "payments",
	invoices: "payments/invoices",
	overview: "",
	report: "reports",
	send: "send",
	settings: "settings",
	verification: "verification",
	withdraw: "withdraw",
};
