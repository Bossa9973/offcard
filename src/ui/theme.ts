import { tokens as t } from "./tokens";

/** Appearance adapter for official iframes. Keep all supported Element hooks here. */
export const monochromeTheme = { appearance: "dark", accentColor: "gray", grayColor: "gray" } as const;
export const panelBackground = t.surface;
const steps = [t.bg, t.surface, "#222222", "#2a2a2a", "#313131", "#3a3a3a", "#484848", "#606060", t.accent, t.text, t["chart-primary"], t.text];
export const monochromeVariables: Record<`--${string}`, string> = {
 "--color-background": t.bg,
 "--color-panel-solid": t.surface,
 "--color-panel-translucent": t.surface,
 "--color-surface": t.surface,
 "--accent-contrast": t.inverse,
 "--gutter-width-lg": "0",
 "--gutter-width-md": "0",
 "--gutter-width-sm": "0",
};
// Neutralize brand/accent hues only. Green, red, ruby, amber and yellow keep their native
// scales so gains, losses, failures and warnings stay legible.
for (const family of ["accent", "blue"]) {
 steps.forEach((value, index) => {
  monochromeVariables[`--${family}-${index + 1}`] = value;
  monochromeVariables[`--${family}-a${index + 1}`] = value;
 });
 monochromeVariables[`--${family}-contrast`] = t.inverse;
 monochromeVariables[`--${family}-surface`] = t.raised;
}

type Rules = Record<string, Record<string, string>>;
// Asset summaries use the official breakdown totals in USD and source units.
// Scope these rules to the two summary frames, leaving cash breakdowns intact.
export const assetSummaryClasses: Rules = {
 "whop-BalanceBreakdownSurface": { padding: "0" },
 "whop-BalanceBreakdownSurface > div > div:not(:first-child)": { display: "none" },
 "whop-BalanceBreakdownSurface h1[class]": { fontFamily: "Inter", fontSize: "40px", fontWeight: "600", lineHeight: "1.1", letterSpacing: "-0.03em" },
};
export const assetQuantityClasses: Rules = {
 ...assetSummaryClasses,
 "whop-BalanceBreakdownSurface > div > div:first-child > div": { display: "none" },
 "whop-BalanceBreakdownSurface h1[class]": { fontFamily: "Inter", fontSize: "16px", fontWeight: "400", lineHeight: "1.5", color: t.muted },
};
const primary = { backgroundColor: t.accent, color: t.inverse, borderRadius: t["radius-control"], minHeight: t["control-height"], padding: "10px 16px", fontWeight: "600" };
export const quietOutlineActionClasses: Rules = {
 "whop-Actions > button": { backgroundColor: "transparent", color: t.text, border: `1px solid ${t["border-strong"]}`, height: "64px", minHeight: t["control-height"], borderRadius: "10px" },
 "whop-Actions > button:hover": { backgroundColor: t.raised, borderColor: t.muted },
 "whop-Actions > button:focus-visible": { outline: `2px solid ${t.text}`, outlineOffset: "-3px" },
};
export const monochromeClasses: Rules = {};
for (const surface of ["Balance", "BalanceRow", "BalancesSurface", "ActivitySurface", "CardsChartSurface", "CardsSurface", "CardsTableSurface", "PaymentsTable", "PaymentDetail", "Report", "ReportActivity", "DepositSurface", "SendSurface", "BalanceBreakdownSurface"]) {
 monochromeClasses[`whop-${surface}`] = { color: t.text };
 for (const tone of ["10", "11"]) monochromeClasses[`whop-${surface} [class*="text-gray-${tone}"]`] = { color: t.muted };
 monochromeClasses[`whop-${surface} [class*="text-gray-12"]`] = { color: t.text };
 monochromeClasses[`whop-${surface} [class*="text-green-11"]`] = { color: t.positive };
 monochromeClasses[`whop-${surface} [class*="text-red-11"]`] = { color: t.negative };
}
Object.assign(monochromeClasses, {
 "whop-Balance": { color: t.text, backgroundColor: t.surface, padding: "0" },
 "whop-BalanceRow": { height: "56px" },
 "whop-BalancesSurface": { padding: "20px 12px 12px", color: t.text, backgroundColor: t.surface, borderWidth: "0", borderRadius: t["radius-panel"] },
 "whop-BalancesSurface > div:first-child > span": { fontSize: t["text-section"], lineHeight: "1.25", fontWeight: "500" },
 "whop-ActivitySurface": { color: t.text, backgroundColor: t.surface, borderColor: "transparent", borderRadius: t["radius-panel"] },
 "whop-ActivitySurface > div:first-child > h1": { fontSize: t["text-section"], lineHeight: "1.25", fontWeight: "500" },
 // Applied filter chips render as soft accent (native blue) buttons; keep them neutral.
 'whop-ActivitySurface button[class*="border-accent-5"]': { backgroundColor: t.raised, color: t.text, borderColor: t["border-strong"] },
 'whop-ActivitySurface button[class*="border-accent-5"]:hover': { backgroundColor: t.hover },
 "whop-CardsTableSurface": { color: t.text, backgroundColor: t.surface, borderColor: t.border, borderRadius: t["radius-panel"] },
 "whop-CardsTableSurface > div:first-child": { padding: "16px 24px" },
 "whop-CardsTableSurface > div:first-child button": primary,
 "whop-CardsTableSurface > div:first-child button:hover": { backgroundColor: t["accent-hover"] },
 "whop-CardsTableRow": { padding: "14px 24px", gap: "16px" },
 "whop-CardsTableRow:hover": { backgroundColor: t.raised },
 "whop-CardsTableRow:focus-visible": { outline: `2px solid ${t.text}`, outlineOffset: "-3px" },
 "whop-CardsTableSurface > div:nth-child(2)": { padding: "10px 24px", gap: "16px" },
 "whop-CardsChartSurface": { color: t.text, backgroundColor: "transparent", border: "0", padding: "0" },
 "whop-CardsChartSurface > div > div:first-child": { gap: "12px" },
 "whop-CardsChartSurface button": { padding: "0 10px", gap: "4px", minHeight: "36px" },
 "whop-CardSurface [aria-hidden] > span:first-of-type": { maxWidth: "calc(100% - 7rem)" },
 // The official reveal/locked controls explicitly select blue instead of the theme accent.
 'whop-CardSurface button[data-accent-color="blue"]': { backgroundColor: t.accent, color: t.inverse },
 'whop-CardSurface button[data-accent-color="blue"]:hover': { backgroundColor: t["accent-hover"] },
 'whop-CardSurface button[data-accent-color="blue"]:focus-visible': { outline: `2px solid ${t.text}`, outlineOffset: "3px" },
 "whop-CardDetailsSurface": { borderRadius: t["radius-panel"], borderWidth: "0" },
 ...quietOutlineActionClasses,
 // One primary money action (Deposit); the rest are secondary so the balance stays the hero.
 "whop-Actions > button": { ...quietOutlineActionClasses["whop-Actions > button"], height: "auto", minHeight: "40px", padding: "8px 4px", backgroundColor: t.raised, color: t.text, borderColor: t.raised, fontWeight: "500" },
 "whop-Actions > button:hover": { backgroundColor: t.hover, borderColor: t.hover },
 "whop-Actions > button:first-child": { backgroundColor: t.accent, color: t.inverse, borderColor: t.accent, fontWeight: "600" },
 "whop-Actions > button:first-child:hover": { backgroundColor: t["accent-hover"], borderColor: t["accent-hover"] },
 "whop-BalanceBreakdownSurface": { padding: "0 12px" },
 "whop-CardsSurface": { backgroundColor: t.surface },
 "whop-PaymentsTable": { color: t.text, backgroundColor: t.surface },
 "whop-PaymentsTable thead": { backgroundColor: t.surface },
 'whop-PaymentsTable [class*="bg-background"]': { backgroundColor: t.surface },
 "whop-Report [class*=\"rounded-xl\"]": { backgroundColor: t.surface, borderColor: t.border, borderRadius: t["radius-panel"] },
 "whop-DepositSurface": { backgroundColor: t.surface, borderRadius: t["radius-panel"] },
 "whop-SendSurface": { backgroundColor: t.surface, borderRadius: t["radius-panel"] },
});

// Chart typography and geometry stay shared even though the official plots differ.
const chartValue = { fontFamily: "Inter", fontSize: t["chart-value-size"], fontWeight: "600", lineHeight: "1.2", letterSpacing: "-0.03em", color: t.text, marginTop: "4px" };
const chartLabel = { fontFamily: "Inter", fontSize: t["chart-label-size"], fontWeight: "500", lineHeight: "20px", color: t.muted };
Object.assign(monochromeClasses, {
 "whop-BalanceTotal > span": chartValue,
 "whop-CardsChartSurface > div > div:first-child > div > span": chartValue,
 "whop-Report > main > div:first-child > div > span:last-child": chartValue,
 "whop-BalanceTotal > div:first-child > span": chartLabel,
 // The balance move uses the accent for both directions; color it by its arrow instead.
 'whop-BalanceTotal div:has(polygon[points^="6 2"])': { color: t.positive },
 'whop-BalanceTotal div:has(polygon[points^="6 2"]) [class*="text-accent-11"]': { color: t.positive },
 'whop-BalanceTotal div:has(polygon[points^="1 2"])': { color: t.negative },
 'whop-BalanceTotal div:has(polygon[points^="1 2"]) [class*="text-accent-11"]': { color: t.negative },
 "whop-CardsChartSurface > div > div:first-child > div > div > span": { ...chartLabel, opacity: "0.75" },
 "whop-Report > main > div:first-child > div > span:first-child": chartLabel,
 "whop-CardsChartSurface > div > div:nth-child(2)": { height: t["chart-height"] },
 "whop-CardsChartSurface svg line": { opacity: "0.3" },
 "whop-CardsChartSurface svg text": { opacity: "0.65", fontFamily: "Inter", fontSize: "12px" },
 "whop-CardsChartSurface button": { backgroundColor: "#090909", border: "1px solid #151515", boxShadow: "none", borderRadius: t["radius-control"], minHeight: "32px", padding: "0 10px", fontWeight: "500" },
 "whop-CardsChartSurface button:hover": { backgroundColor: "#111111" },
 "whop-BalanceRanges button": { minHeight: "32px", padding: "0 10px", borderRadius: t["radius-control"], fontSize: "12px", fontWeight: "500" },
 "whop-Report > main": { paddingTop: "0" },
 "whop-Report > main > div:first-child": { padding: "24px 24px 0", border: `1px solid ${t.border}`, borderBottom: "0", borderRadius: "12px 12px 0 0" },
 "whop-Report > main > div:nth-child(2)": { height: `${Number.parseInt(t["chart-height"], 10) + 24}px`, marginTop: "0", padding: "24px 24px 0", borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` },
 "whop-Report > main > section:first-of-type": { marginTop: "0", padding: "24px", border: `1px solid ${t.border}`, borderTop: "0", borderRadius: "0 0 12px 12px", marginBottom: "24px" },
 "whop-Report > main > section:first-of-type button": { minHeight: "32px", padding: "0 10px", fontSize: "12px", fontWeight: "500" },
});

/** Narrow cards: keep all fields, stack the row rather than losing names to ellipses. */
export const compactCardTableClasses: Rules = {
 "whop-CardsChartSurface > div > div:first-child": { display: "block" },
 "whop-CardsChartSurface > div > div:first-child > button": { marginTop: "12px" },
 "whop-CardsTableSurface > div:first-child": { padding: "16px", display: "block" },
 "whop-CardsTableSurface > div:first-child > button": { marginTop: "12px", width: "100%" },
 "whop-CardsTableSurface > div:nth-child(2)": { display: "none" },
 "whop-CardsTableRow": { display: "block", padding: "16px", borderBottom: `1px solid ${t.border}` },
 "whop-CardsTableRow > div:first-child": { display: "block", width: "100%", marginBottom: "12px", minWidth: "0" },
 "whop-CardsTableRow > div:first-child > div": { width: "100%", minWidth: "0" },
 "whop-CardsTableRow > div:first-child > div > span": { whiteSpace: "normal" },
 "whop-CardsTableRow > div:nth-child(2)": { display: "inline-flex", width: "58%" },
 "whop-CardsTableRow > div:nth-child(3)": { display: "inline-block", width: "42%" },
 "whop-CardsTableRow > div:nth-child(3) > span": { paddingRight: "0" },
};
export const monochromeAppearance = { theme: monochromeTheme, variables: monochromeVariables, classes: monochromeClasses };
