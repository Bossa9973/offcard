import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { SignIn } from "../src/ui/parts/sign-in";
import { BankCard } from "../src/ui/components/bank-card";
import { PRODUCT_FACTS } from "../src/content/productFacts";

test("production landing page contains zero raw compliance placeholders", () => {
	const html = renderToStaticMarkup(createElement(SignIn, {}));

	// Fails build if any string matches [(issuer|network)] or TODO(compliance)
	const placeholderPattern = /\[(issuer|network)\]|TODO\(compliance\)/i;
	const match = html.match(placeholderPattern);

	assert.equal(
		match,
		null,
		`Production page must not contain compliance placeholders: found "${match?.[0]}"`
	);

	// Verify footer has clean single merged disclosure
	assert.ok(
		html.includes("Off-Card is a financial technology platform, not a bank"),
		"Footer must include official platform disclosure"
	);
	assert.ok(
		!html.includes("[issuer]"),
		"Footer must not contain [issuer]"
	);
	assert.ok(
		!html.includes("[network]"),
		"Footer must not contain [network]"
	);
});

test("BankCard renders full Moneta reference artwork and real content", () => {
	const darkHtml = renderToStaticMarkup(
		createElement(BankCard, {
			variant: "dark",
			balance: "$5,750.20",
			cardNumber: "5282 3456 7890 2343",
			expiry: "08/28",
			holder: "ALEX MORGAN",
		})
	);

	// Pinstripe layer present
	assert.ok(darkHtml.includes("off-pinstripe"), "Dark card must contain pinstripe artwork");
	// Text scrims present
	assert.ok(darkHtml.includes("off-bank-card__scrim"), "Dark card must contain text scrims for contrast");
	// Real content present
	assert.ok(darkHtml.includes("$5,750.20"), "Dark card must display balance");
	assert.ok(darkHtml.includes("5282 3456 7890 2343"), "Dark card must display card digits");
	assert.ok(darkHtml.includes("08/28"), "Dark card must display expiry");
	assert.ok(darkHtml.includes("off-wordmark"), "Dark card must display wordmark");

	// Light Card
	const lightHtml = renderToStaticMarkup(
		createElement(BankCard, {
			variant: "light",
			balance: "$5,750.20",
			assetBadge: "USDC",
			networkLabel: "Funded by USDC",
			last4: "7474",
			expiry: "08/28",
		})
	);

	// Real SVG Currency icon present
	assert.ok(lightHtml.includes("off-currency-icon--usdc"), "Light card must render authentic SVG USDC icon");
	assert.ok(lightHtml.includes("$5,750.20"), "Light card must display balance");
	assert.ok(!lightHtml.includes("off-pinstripe"), "Light card must not contain pinstripes");
});
