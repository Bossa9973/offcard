import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { BankCard } from "../src/ui/components/bank-card";

test("decorative bank card renders zero text nodes, no numbers, no chip, and no wordmark", () => {
	const darkHtml = renderToStaticMarkup(
		createElement(BankCard, {
			variant: "dark",
			decorative: true,
			holder: "ALEX MORGAN",
			balance: "$5,750.20",
			last4: "2343",
		})
	);

	const lightHtml = renderToStaticMarkup(
		createElement(BankCard, {
			variant: "light",
			decorative: true,
			holder: "ALEX MORGAN",
			balance: "$95,000.00",
			last4: "7474",
		})
	);

	// Strip all HTML and SVG tags to inspect remaining text content
	const extractText = (html: string) => html.replace(/<[^>]+>/g, "").trim();

	assert.equal(extractText(darkHtml), "", "Dark decorative card must contain no text");
	assert.equal(extractText(lightHtml), "", "Light decorative card must contain no text");

	// Explicitly verify sensitive/branding strings are absent
	assert.ok(!darkHtml.includes("ALEX MORGAN"), "Dark card must not contain cardholder name");
	assert.ok(!darkHtml.includes("off-card"), "Dark decorative card must not render wordmark");
	assert.ok(!darkHtml.includes("••••"), "Dark decorative card must not render digits");
	assert.ok(!darkHtml.includes("off-bank-card__chip"), "Dark decorative card must not render chip");

	assert.ok(!lightHtml.includes("ALEX MORGAN"), "Light card must not contain cardholder name");
	assert.ok(!lightHtml.includes("off-card"), "Light decorative card must not render wordmark");
	assert.ok(!lightHtml.includes("••••"), "Light decorative card must not render digits");
	assert.ok(!lightHtml.includes("off-bank-card__chip"), "Light decorative card must not render chip");
});
